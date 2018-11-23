import { getOwner } from '@ember/application';
import Service from '@ember/service';
import EmberObject, { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { isArray } from '@ember/array';
import { warn } from '@ember/debug';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-installatievergadering-plugin
 * @class RdfaEditorInstallatievergaderingPlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorInstallatievergaderingPlugin = Service.extend({
  insertBurgemeesterText: 'http://mu.semte.ch/vocabularies/ext/insertBurgemeesterText',
  insertBurgemeesterOutput: 'http://mu.semte.ch/vocabularies/ext/insertBurgemeesterOutput',
  insertBurgemeesterCard: 'editor-plugins/insert-burgemeester-card',

  /**
   * Restartable task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} contexts RDFa contexts of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
  execute: task(function * (hrId, contexts, hintsRegistry, editor) {
    if (contexts.length === 0) return [];

    let cardMap= {};
    for(let context of contexts){
      this.setBestuursorgaanIfSet(context.context);
      let triple = this.detectRelevantContext(context);
      if(!triple) continue;

      let domNode = this.findDomNodeForContext(editor, context, this.domNodeMatchesRdfaInstructive(triple));

      if(!domNode) continue;


      //insert burgemeester scenario
      if(triple.predicate == this.insertBurgemeesterText){
        hintsRegistry.removeHintsInRegion(context.region, hrId, this.insertBurgemeesterCard);
        let hints = this.generateHintsForContext(context, triple, domNode, editor);
        let cards = hints.map(h => this.generateCard(hrId, hintsRegistry, editor, h, this.insertBurgemeesterCard));
        cardMap[this.insertBurgemeesterCard] = [...(cardMap[this.insertBurgemeesterCard] || []), ...cards];
      }

      //edit burgemeester scenario
      let domNodeRegion = [ editor.getRichNodeFor(domNode).start, editor.getRichNodeFor(domNode).end ];
      if(triple.predicate == this.insertBurgemeesterOutput && //sometimes it hints twice
         !(cardMap[this.insertBurgemeesterCard] || []).find(c => c.location[0] == domNodeRegion[0] && c.location[1] == domNodeRegion[1])){
        hintsRegistry.removeHintsInRegion(domNodeRegion, hrId, this.insertBurgemeesterCard);
        let hints = this.generateHintsForContext(context, triple, domNode, editor);
        let cards = hints.map(h => this.generateCard(hrId, hintsRegistry, editor, h, this.insertBurgemeesterCard));
        cardMap[this.insertBurgemeesterCard] = [...(cardMap[this.insertBurgemeesterCard] || []), ...cards];
      }

    }

    if(Object.values(cardMap).length > 0){
      Object.keys(cardMap).forEach(k => hintsRegistry.addHints(hrId, k, cardMap[k]));
    }
  }).keepLatest(),

  /**
   * Given context object, tries to detect a context the plugin can work on
   *
   * @method detectRelevantContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {String} URI of context if found, else empty string.
   *
   * @private
   */
  detectRelevantContext(context){
    if(context.context.slice(-1)[0].predicate == this.insertBurgemeesterText){
      return context.context.slice(-1)[0];
    }
    if(context.context.slice(-1)[0].predicate == this.insertBurgemeesterOutput){
      return context.context.slice(-1)[0];
    }
    return null;
  },

  /**
   * Generates a card given a hint
   *
   * @method generateCard
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   * @param {Object} hint containing the hinted string and the location of this string
   *
   * @return {Object} The card to hint for a given template
   *
   * @private
   */
  generateCard(hrId, hintsRegistry, editor, hint, cardName){
    return EmberObject.create({
      info: {
        plainValue: hint.text,
        location: hint.location,
        domNodeToUpdate: hint.domNode,
        instructiveUri: hint.instructiveUri,
        hrId, hintsRegistry, editor
      },
      location: hint.location,
      options: hint.options,
      card: cardName
    });
  },

  /**
   * Generates a hint, given a context
   *
   * @method generateHintsForContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {Object} [{dateString, location}]
   *
   * @private
   */
  generateHintsForContext(context, instructiveTriple, domNode, editor, options = {}){
    const hints = [];
    const text = context.text;
    let location = context.region;
    if(instructiveTriple.predicate == this.insertBurgemeesterOutput){
      location = [ editor.getRichNodeFor(domNode).start, editor.getRichNodeFor(domNode).end ];
      options.noHighlight= true;
    }
    hints.push({text, location, domNode, instructiveUri: instructiveTriple.predicate, options});
    return hints;
  },

  ascendDomNodesUntil(rootNode, domNode, condition){
    if(!domNode || rootNode.isEqualNode(domNode)) return null;
    if(!condition(domNode))
      return this.ascendDomNodesUntil(rootNode, domNode.parentElement, condition);
    return domNode;
  },

  domNodeMatchesRdfaInstructive(instructiveRdfa){
    let ext = 'http://mu.semte.ch/vocabularies/ext/';
    return (domNode) => {
      if(!domNode.attributes || !domNode.attributes.property)
        return false;
      let expandedProperty = domNode.attributes.property.value.replace('ext:', ext);
      if(instructiveRdfa.predicate == expandedProperty)
        return true;
      return false;
    };
  },

  findDomNodeForContext(editor, context, condition){
    let richNodes = isArray(context.richNode) ? context.richNode : [ context.richNode ];
    let domNode = richNodes
          .map(r => this.ascendDomNodesUntil(editor.rootNode, r.domNode, condition))
          .find(d => d);
    if(!domNode){
      warn(`Trying to work on unattached domNode. Sorry can't handle these...`, {id: 'fractievorming.domNode'});
    }
    return domNode;
  },

  setBestuursorgaanIfSet(triples) {
    const zitting = triples.find((triple) => triple.object === 'http://data.vlaanderen.be/ns/besluit#Zitting');
    if (zitting) {
      const bestuursorgaan = triples.find((triple) => triple.subject === zitting.subject && triple.predicate === 'http://data.vlaanderen.be/ns/besluit#isGehoudenDoor');
      if (bestuursorgaan){
        this.set('bestuursorgaanUri', bestuursorgaan.object);
      }
    }
  }
});

RdfaEditorInstallatievergaderingPlugin.reopen({
  who: 'editor-plugins/installatievergadering-card'
});
export default RdfaEditorInstallatievergaderingPlugin;