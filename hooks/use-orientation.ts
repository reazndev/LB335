import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>(
    getOrientation(Dimensions.get('window'))
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }: { window: ScaledSize }) => {
        setOrientation(getOrientation(window));
      }
    );

    return () => subscription?.remove();
  }, []);

  return orientation;
}

function getOrientation(dim: ScaledSize): Orientation {
  return dim.width >= dim.height ? 'landscape' : 'portrait';
}
