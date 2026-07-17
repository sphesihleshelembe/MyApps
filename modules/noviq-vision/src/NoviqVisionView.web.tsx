import * as React from 'react';

import { NoviqVisionViewProps } from './NoviqVision.types';

export default function NoviqVisionView(props: NoviqVisionViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
