import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import getProducts from '@/data/productService';
import { findProductByBarcode } from '@/utils/productAnalyzer';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { AlertCircle, Scan } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, StyleSheet, Text, View, Animated } from 'react-native';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const scanLinePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
      if (scanned) return;
      
      setScanned(true);
      
      try {
        const products = await getProducts();
        const product = findProductByBarcode(data, products);
        
        if (product) {
          router.push(`/product/${product.id}`);
        } else {
          Alert.alert(
            'Product Not Found',
            'We couldn\'t find this product in our database. Please try scanning another product.',
            [
              {
                text: 'OK',
                onPress: () => setScanned(false),
              },
            ]
          );
        }
      } catch (error) {
        console.error('Failed to load products', error);
        Alert.alert(
          'Error',
          'Unable to load product data. Please try again later.',)
      };

    }

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
        <Text style={styles.title}>ต้องการสิทธิ์เข้าถึงกล้อง</Text>
        <Text style={styles.text}>
          เราต้องการสิทธิ์เข้าถึงกล้องเพื่อสแกนบาร์โค้ดสินค้า กรุณาอนุญาตเพื่อดำเนินการต่อ
        </Text>
        <Button
          title="อนุญาต"
          onPress={requestPermission}
          style={styles.button}
        />
      </View>
    );
  }

  const scanLineTranslateY = scanLinePosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

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
          {/* Top section */}
          <View style={styles.topSection}>
            <Text style={styles.mainTitle}>สแกนบาร์โค้ด</Text>
            <Text style={styles.subtitle}>
              วางบาร์โค้ดให้อยู่ในกรอบด้านล่าง
            </Text>
          </View>

          {/* Barcode scanning area */}
          <View style={styles.scanFrame}>
            {/* Corner decorations */}
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
            
            {/* Animated scan line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />
            )}

            {/* Barcode icon in center */}
            <View style={styles.barcodeIconContainer}>
              <View style={styles.barcodeLines}>
                <View style={[styles.barcodeLine, { width: 3 }]} />
                <View style={[styles.barcodeLine, { width: 2 }]} />
                <View style={[styles.barcodeLine, { width: 4 }]} />
                <View style={[styles.barcodeLine, { width: 2 }]} />
                <View style={[styles.barcodeLine, { width: 3 }]} />
                <View style={[styles.barcodeLine, { width: 2 }]} />
                <View style={[styles.barcodeLine, { width: 4 }]} />
                <View style={[styles.barcodeLine, { width: 3 }]} />
              </View>
            </View>
          </View>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            {scanned ? (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>✓ สแกนสำเร็จ</Text>
              </View>
            ) : (
              <Text style={styles.instructions}>
                กรุณาวางบาร์โค้ดให้อยู่ในแนวนอน
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title={scanned ? "สแกนอีกครั้ง" : "พลิกกล้อง"}
                onPress={scanned ? () => setScanned(false) : toggleCameraFacing}
                variant={scanned ? "primary" : "outline"}
                style={scanned ? styles.scanButton : styles.flipButton}
              />
            </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  scanIcon: {
    marginBottom: 16,
  },
  mainTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  scanFrame: {
    width: '85%',
    height: 120,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 5,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  barcodeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  barcodeLines: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  barcodeLine: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  statusContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 30,
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  buttonContainer: {
    width: '80%',
  },
  flipButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
  },
  scanButton: {
    backgroundColor: Colors.primary,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
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