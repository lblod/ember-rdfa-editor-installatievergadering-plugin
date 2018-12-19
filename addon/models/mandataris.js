import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
  rangorde: attr('language-string'),
  start: attr('datetime'),
  einde: attr('datetime'),
  datumEedaflegging: attr('datetime'),
  datumMinistrieelBesluit: attr('datetime'),
  bekleedt: belongsTo('mandaat', { inverse: null }),
  isBestuurlijkeAliasVan: belongsTo('persoon', { inverse: 'isAangesteldAls' }),
  tijdelijkeVervangingen: hasMany('mandataris', { inverse: null }),
  status: belongsTo('mandataris-status-code', { inverse: null })
});
