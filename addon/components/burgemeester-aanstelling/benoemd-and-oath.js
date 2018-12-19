import Component from '@ember/component';
import layout from '../../templates/components/burgemeester-aanstelling/benoemd-and-oath';
import uuid from 'uuid/v4';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  artikelUri: computed('computed', function(){
    return `http://data.lblod.info/artikels/${uuid()}`;
  }),

  mandataris: computed('burgemeesters.[]', 'burgemeesters', function(){
    if(this.burgemeesters)
      return this.burgemeesters.firstObject; //assuming users know best
    return null;
  })
});
