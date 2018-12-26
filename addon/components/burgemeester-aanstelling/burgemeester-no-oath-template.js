import Component from '@ember/component';
import layout from '../../templates/components/burgemeester-aanstelling/burgemeester-no-oath-template';
import { computed } from '@ember/object';
import uuid from 'uuid/v4';

export default Component.extend({
  layout,

  init() {
    this._super(...arguments);
    this.set('articleId', uuid());
  },

  burgemeesterPersoonId1: computed('elementId', function() {
    return `burgemeester-persoon-1-${this.elementId}`;
  }),
  burgemeesterPersoonId2: computed('elementId', function() {
    return `burgemeester-persoon-2-${this.elementId}`;
  }),
  burgemeesterPersoonId3: computed('elementId', function() {
    return `burgemeester-persoon-3-${this.elementId}`;
  })
});
