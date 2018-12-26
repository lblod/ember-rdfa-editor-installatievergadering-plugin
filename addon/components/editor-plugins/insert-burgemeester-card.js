import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/insert-burgemeester-card';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import uuid from 'uuid/v4';
import moment from 'moment';

export default Component.extend({
  layout,
  store: service(),
  collegeClassificatieUri: 'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000006',
  burgemeesterClassificatieUri: 'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/5ab0e9b8a3b2ca7c5e000013',
  rdfaEditorInstallatievergaderingPlugin: service(),
  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  location: reads('info.location'),

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  hrId: reads('info.hrId'),

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  editor: reads('info.editor'),

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  hintsRegistry: reads('info.hintsRegistry'),

  bestuursorgaanUri: reads('rdfaEditorInstallatievergaderingPlugin.bestuursorgaanUri'),


  async setBurgemeesters(){
    if(this.burgemeesters)
      return;
    let query = {
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][bestuurseenheid][:uri:]': this.bestuurseenheid.uri,
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][classificatie][:uri:]': this.collegeClassificatieUri,
      'filter[bekleedt][bestuursfunctie][:uri:]': this.burgemeesterClassificatieUri,
      'filter[bekleedt][bevat-in][binding-start]': moment(this.bestuursorgaan.bindingStart).format('YYYY-MM-DD'),
      'sort': '-bekleedt.bevat-in.binding-start',
      'include': 'is-bestuurlijke-alias-van'
    };

    let burgemeesters = await this.store.query('mandataris', query);
    this.set('burgemeesters', burgemeesters);
  },


  async setProperties() {
    let bestuurseenheid = ( await this.store.query('bestuurseenheid',
                                           { 'filter[bestuursorganen][heeft-tijdsspecialisaties][:uri:]': this.bestuursorgaanUri }
                                                 )).firstObject;
    this.set('bestuurseenheid', bestuurseenheid);

    let bestuursorgaan = (await this.store.query('bestuursorgaan',
                                                  { 'filter[:uri:]': this.bestuursorgaanUri }
                                                )).firstObject;
    this.set('bestuursorgaan', bestuursorgaan);
    await this.setBurgemeesters();
  },

  createWrappingHTML(innerHTML){
    //adds uuid to trigger diff. Do it both on top and down the table to make sure everything gets triggered properly
    return `<div property="ext:insertBurgemeesterOutput">
            <span class="u-hidden">${uuid()}</span>
            ${innerHTML}
            <span class="u-hidden">${uuid()}</span>
           </div>`;
  },

  loadData: task(function *(){
    yield this.setProperties();
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    if(this.bestuursorgaanUri)
      this.loadData.perform();
  },

  outputNoMayor: computed('id', function() {
    return `output-no-mayor-${this.elementId}`;
  }),

  outputNoMayorNewStyle: computed('id', function() {
    return `output-no-mayor-new-style-${this.elementId}`;
  }),

  outputMayorNoOath: computed('id', function() {
    return `output-mayor-no-oath${this.elementId}`;
  }),

  outputMayorNoOathNewStyle: computed('id', function() {
    return `output-mayor-no-oath-new-style-${this.elementId}`;
  }),

  outputMayorBenoemdAndOath: computed('id', function(){
    return `output-mayor-benoemd-and-oath${this.elementId}`;
  }),

  outputMayorBenoemdAndOathNewStyle: computed('id', function(){
    return `output-mayor-benoemd-and-oath-new-style${this.elementId}`;
  }),

  actions: {
    insert(){
      const html = this.createWrappingHTML(document.getElementById(this.outputId).innerHTML);
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.info.who);
      this.get('editor').replaceNodeWithHTML(this.info.domNodeToUpdate, html);
    },
    insertNoMayor(newStyle){
      let html = this.createWrappingHTML(document.getElementById(this.outputNoMayor).innerHTML);
      if(newStyle)
        html = this.createWrappingHTML(document.getElementById(this.outputNoMayorNewStyle).innerHTML);
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.info.who);
      this.get('editor').replaceNodeWithHTML(this.info.domNodeToUpdate, html);
    },
    insertMayorNoOath(newStyle){
      let html = '';
      if (newStyle)
        html = this.createWrappingHTML(document.getElementById(this.outputMayorNoOath).innerHTML);
      else
        html = this.createWrappingHTML(document.getElementById(this.outputMayorNoOathNewStyle).innerHTML);
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.info.who);
      this.get('editor').replaceNodeWithHTML(this.info.domNodeToUpdate, html);
    },
    insertMayorBenoemdAndOath(newStyle){
      let html = this.createWrappingHTML(document.getElementById(this.outputMayorBenoemdAndOath).innerHTML);
      if(newStyle)
        html = this.createWrappingHTML(document.getElementById(this.outputMayorBenoemdAndOathNewStyle).innerHTML);
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.info.who);
      this.get('editor').replaceNodeWithHTML(this.info.domNodeToUpdate, html);
    },
    togglePopup(){
       this.toggleProperty('popup');
    }
  }

});
