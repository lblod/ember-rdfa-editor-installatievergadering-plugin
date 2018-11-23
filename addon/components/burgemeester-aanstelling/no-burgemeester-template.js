import Component from '@ember/component';
import layout from '../../templates/components/burgemeester-aanstelling/no-burgemeester-template';

export default Component.extend({
  layout,
  didReceiveAttrs() {
    this._super(...arguments);
    this.set('timestampToTriggerDiff', new Date().toISOString());
  }
});
