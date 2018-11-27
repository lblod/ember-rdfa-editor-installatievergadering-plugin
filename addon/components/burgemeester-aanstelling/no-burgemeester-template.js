import Component from '@ember/component';
import layout from '../../templates/components/burgemeester-aanstelling/no-burgemeester-template';
import { computed } from '@ember/object';

export default Component.extend({
  layout,

  burgemeesterPersoonId: computed('elementId', function() {
    return `burgemeester-persoon-1-${this.elementId}`;
  })
});
