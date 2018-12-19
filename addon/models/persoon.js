import Model from 'ember-data/model';
import { collect } from '@ember/object/computed';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
  // A string representation of this model, based on its attributes.
  // This is what mu-cl-resources uses to search on, and how the model will be presented while editing relationships.
  stringRep: collect.apply(this,['id', 'achternaam', 'alternatieveNaam', 'gebruikteVoornaam']),

  achternaam: attr(),
  alternatieveNaam: attr(),
  gebruikteVoornaam: attr(),
  identificator: belongsTo('identificator', { inverse: null }),
  geslacht: belongsTo('geslacht-code', { inverse: null }),
  isAangesteldAls: hasMany('mandataris', { inverse: 'isBestuurlijkeAliasVan' }),
  isKandidaatVoor: hasMany('kandidatenlijst', { inverse: 'kandidaten' }),
  verkiezingsresultaten: hasMany('verkiezingsresultaat', { inverse: null}),
  geboorte: belongsTo('geboorte', { inverse: null }),

  rdfaBindings: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
    class: "http://www.w3.org/ns/person#Person",
    achternaam: "http://xmlns.com/foaf/0.1/familyName",
    gebruikteVoornaam: "http://data.vlaanderen.be/ns/persoon#gebruikteVoornaam",
    alternatieveNaam: "http://xmlns.com/foaf/0.1/name",
    geslacht: "http://data.vlaanderen.be/ns/persoon#geslacht",
    isAangesteldAls: "http://data.vlaanderen.be/ns/mandaat#isAangesteldAls",
    geboorte: "http://data.vlaanderen.be/ns/persoon#heeftGeboorte"
  }
});
