import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Share, Linking, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

interface MoreOptionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onOptionPress: (option: string) => void;
}

const MoreOptionsModal: React.FC<MoreOptionsModalProps> = ({
  isVisible, onClose, onOptionPress
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          'Confira o aplicativo Código Civil Digital!',
        url: 'https://example.com/app-link', // Substitua pelo link real do seu app
        title: 'Código Civil Digital',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleHelp = async () => {
    const helpUrl = 'https://www.google.com'; // Substitua pela URL da sua página de ajuda
    WebBrowser.openBrowserAsync(helpUrl);
  };

  const handleRateApp = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('itms-apps://itunes.apple.com/app/idYOUR_APP_ID'); // Substitua YOUR_APP_ID pelo ID do seu app na App Store
    } else {
      Linking.openURL('market://details?id=com.yourcompany.yourapp'); // Substitua com.yourcompany.yourapp pelo ID do seu app na Google Play Store
    }
  };

  const handleInternalOptionPress = (option: string) => {
    onClose(); // Fecha o modal ao selecionar uma opção
    switch (option) {
      case 'settings':
        Alert.alert("Configurações", "Funcionalidade de configurações em desenvolvimento.");
        break;
      case 'help':
        handleHelp();
        break;
      case 'about':
        Alert.alert("Código Civil MZ", `Código Civil MZ v${require('../../app.json').expo.version}\nDesenvolvido pela Learn Code`);
        break;
      case 'share':
        handleShare();
        break;
      case 'rate':
        handleRateApp();
        break;
      default:
        break;
    }
    onOptionPress(option); // Chama o callback externo, se houver
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Mais Opções</Text>

          <TouchableOpacity style={styles.optionButton} onPress={() => handleInternalOptionPress('settings')}> 
            <Feather name="settings" size={20} color={colors.text} style={styles.optionIcon} />
            <Text style={styles.optionText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => handleInternalOptionPress('help')}> 
            <Feather name="help-circle" size={20} color={colors.text} style={styles.optionIcon} />
            <Text style={styles.optionText}>Ajuda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => handleInternalOptionPress('about')}> 
            <Feather name="info" size={20} color={colors.text} style={styles.optionIcon} />
            <Text style={styles.optionText}>Sobre o App</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => handleInternalOptionPress('share')}> 
            <Feather name="share-2" size={20} color={colors.text} style={styles.optionIcon} />
            <Text style={styles.optionText}>Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => handleInternalOptionPress('rate')}> 
            <Feather name="star" size={20} color={colors.text} style={styles.optionIcon} />
            <Text style={styles.optionText}>Avaliar o App</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionButton, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: 'SF-Pro-Display-Bold',
    fontSize: 20,
    lineHeight: 20 * 1.5,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontFamily: 'SF-Pro-Display-Regular',
    fontSize: 18,
    lineHeight: 18 * 1.5,
    color: colors.text,
  },
  cancelButton: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 0,
  },
  cancelButtonText: {
    fontFamily: 'SF-Pro-Display-Regular',
    fontSize: 18,
    lineHeight: 18 * 1.5,
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },
});

export default MoreOptionsModal;
