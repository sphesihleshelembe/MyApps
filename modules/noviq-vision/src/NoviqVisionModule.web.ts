import { registerWebModule, NativeModule } from 'expo';

import { NoviqVisionModuleEvents } from './NoviqVision.types';

class NoviqVisionModule extends NativeModule<NoviqVisionModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(NoviqVisionModule, 'NoviqVisionModule');
