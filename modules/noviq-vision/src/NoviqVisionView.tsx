import { requireNativeView } from 'expo';
import * as React from 'react';

import { NoviqVisionViewProps } from './NoviqVision.types';

const NativeView: React.ComponentType<NoviqVisionViewProps> =
  requireNativeView('NoviqVision');

export default function NoviqVisionView(props: NoviqVisionViewProps) {
  return <NativeView {...props} />;
}
