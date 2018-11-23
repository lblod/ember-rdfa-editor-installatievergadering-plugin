import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/insert-burgemeester-card';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';

export default Component.extend({
  layout,
  store: service(),
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

  async setProperties() {
    let bestuurseenheid = ( await this.store.query('bestuurseenheid',
                                           { 'filter[bestuursorganen][heeft-tijdsspecialisaties][:uri:]': this.bestuursorgaanUri }
                                                 )).firstObject;
    this.set('bestuurseenheid', bestuurseenheid);

    let bestuursorgaan = (await this.store.query('bestuursorgaan',
                                                  { 'filter[:uri:]': this.bestuursorgaanUri }
                                                )).firstObject;
    this.set('bestuursorgaan', bestuursorgaan);
  },

  createWrappingHTML(innerHTML){
    return `<div property="ext:insertBurgemeesterOutput">${innerHTML}</div>`;
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
  
  actions: {
    insert(){
      const html = this.createWrappingHTML(document.getElementById(this.outputId).innerHTML);
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.info.who);
      this.get('editor').replaceNodeWithHTML(this.info.domNodeToUpdate, html);
    },
    insertNoMayor(){
      const html = this.createWrappingHTML(document.getElementById(this.outputNoMayor).innerHTML);
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.info.who);
      this.get('editor').replaceNodeWithHTML(this.info.domNodeToUpdate, html);
    },
    togglePopup(){
       this.toggleProperty('popup');
    }
  }

});
