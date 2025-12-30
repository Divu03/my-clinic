import MapView from 'react-native-maps';
import { useMapViewModel } from '../../src/viewmodels/useMapViewModel';

export default function MapScreen() {
  const { points } = useMapViewModel();

  return (
    <MapView style={{ flex: 1 }}>
      {points.map((point, index) => (
        // <Marker
        //   key={index}
        //   coordinate={{ latitude: point.lat, longitude: point.lng }}
        //   title={point.name}
        // />
        <view key={index}>
          <text>Hello</text>
        </view>
      ))}
    </MapView>
  );
}