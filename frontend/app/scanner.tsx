import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import fetchProducts from '@/data/productService';
import { findProductByBarcode } from '@/utils/productAnalyzer';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);
  const isNavigatingRef = useRef(false);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    return () => {
      isNavigatingRef.current = false;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      isNavigatingRef.current = false;
      return undefined;
    }, [])
  );

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    const now = Date.now();
    const lastScan = lastScanRef.current;

    if (scanned || isNavigatingRef.current) return;
    if (lastScan && lastScan.code === data && now - lastScan.at < 1000) return;

    lastScanRef.current = { code: data, at: now };
    setScanned(true);
    isNavigatingRef.current = true;

    try {
      const products = await fetchProducts();
      const product = findProductByBarcode(data, products);

      if (product) {
        router.push(`/product/${product.id}`);
      } else {
        isNavigatingRef.current = false;
        Alert.alert(
          'ไม่พบสินค้า',
          'ไม่พบสินค้านี้ในฐานข้อมูล กรุณาลองสแกนสินค้าอื่น',
          [
            {
              text: 'ตกลง',
              onPress: () => setScanned(false),
            },
          ]
        );
      }
    } catch (error) {
      isNavigatingRef.current = false;
      console.error('Failed to load products', error);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้งภายหลัง',
        [
          {
            text: 'ตกลง',
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>กำลังขอสิทธิ์เข้าถึงกล้อง...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <AlertCircle size={64} color={Colors.primary} style={styles.icon} />
        <Text className='text-2xl font-bold text-center text-red-500 mb-2'>ต้องใช้สิทธิ์เข้าถึงกล้อง</Text>
        <Text style={styles.text}>
          แอปต้องใช้สิทธิ์เข้าถึงกล้องเพื่อสแกนบาร์โค้ดสินค้า กรุณาอนุญาตเพื่อดำเนินการต่อ
        </Text>
        <Button
          title="อนุญาต"
          onPress={requestPermission}
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>

          <Text style={styles.instructions}>
            วางบาร์โค้ดให้อยู่ภายในกรอบเพื่อสแกน
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="สลับกล้อง"
              onPress={toggleCameraFacing}
              variant="outline"
              style={styles.flipButton}
            />

            {scanned && !isNavigatingRef.current && (
              <Button
                title="สแกนอีกครั้ง"
                onPress={() => setScanned(false)}
                variant="primary"
                style={styles.scanButton}
              />
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.primary,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.primary,
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  flipButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#fff',
    marginRight: 10,
  },
  scanButton: {
    marginLeft: 10,
  },
  icon: {
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});
