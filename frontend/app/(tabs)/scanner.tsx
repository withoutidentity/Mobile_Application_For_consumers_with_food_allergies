import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import getProducts from '@/data/productService';
import { addScanToHistory } from '@/data/userService'; // 1. Import addScanToHistory
import { findProductByBarcode } from '@/utils/productAnalyzer';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

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
        addScanToHistory(product.id); // 2. เรียกใช้ฟังก์ชันเพื่อบันทึกประวัติ
        router.push(`/product/${product.id}`);
        setScanned(false)
      } else {
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
            {/* Corner decorations - Top Left */}
            <View style={styles.cornerTopLeft} />
            
            {/* Corner decorations - Top Right */}
            <View style={styles.cornerTopRight} />
            
            {/* Corner decorations - Bottom Left */}
            <View style={styles.cornerBottomLeft} />
            
            {/* Corner decorations - Bottom Right */}
            <View style={styles.cornerBottomRight} />
            
            {/* Static scan line */}
            {!scanned && (
              <View style={styles.scanLine} />
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
            {scanned && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>กำลังตรวจสอบ...</Text>
              </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
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
    height: 200,
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
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: '#4fd1c5',
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: '#4fd1c5',
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: '#4fd1c5',
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: '#4fd1c5',
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#4fd1c5',
    shadowColor: '#4fd1c5',
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
    height: 50,
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
    backgroundColor: 'rgba(79, 209, 197, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
