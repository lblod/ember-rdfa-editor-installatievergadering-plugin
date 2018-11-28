import Component from '@ember/component';
import layout from '../../templates/components/burgemeester-aanstelling/no-burgemeester-template';
import { computed } from '@ember/object';
import uuid from 'uuid/v4';

export default Component.extend({
  layout,

  init() {
    this._super(...arguments);
    this.set('articleId', uuid());
  }
});
