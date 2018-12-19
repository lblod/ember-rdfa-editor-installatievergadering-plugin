import Component from '@ember/component';
import layout from '../../templates/components/burgemeester-aanstelling/benoemd-and-oath';
import uuid from 'uuid/v4';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
  layout,
  artikelUri: computed('computed', function(){
    return `http://data.lblod.info/artikels/${uuid()}`;
  }),

  mandataris: computed('burgemeesters.[]', 'burgemeesters', function(){
    if(this.burgemeesters)
      return this.burgemeesters.firstObject; //assuming users know best
    return null;
  }),

  mandatarisStartOutput: computed('mandataris', 'mandataris.start', function(){
    if(this.mandataris.start)
      return moment(this.mandataris.start).format('LL');
    return '<span class="mark-highlight-manual">Voer start ambt burgemeester in</span>';
  }),

  mandatarisEedaflegging: computed('mandataris', function(){
    if(this.mandataris.datumEedaflegging)
      return moment(this.mandataris.datumEedaflegging).format('LL');
    return '<span class="mark-highlight-manual">Voer datum eedaflegging burgemeester in</span>';
  }),

  mandatarisMinBesluit: computed('mandataris', function(){
    if(this.mandataris.datumMinistrieelBesluit)
      return moment(this.mandataris.datumMinistrieelBesluit).format('LL');
    return '<span class="mark-highlight-manual">Typ datum</span>';
  })
});
