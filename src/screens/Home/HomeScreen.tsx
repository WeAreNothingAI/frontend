import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import useWebSocket from '../../hooks/useWebSocket';
import ApiService from '../../services/api';
import { ROUTES } from '../../constants/config';
import { RootStackParamList } from '../../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface SocketMessage {
  message: string;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [message, setMessage] = useState<string>('');
  const { emit, on } = useWebSocket();

  useEffect(() => {
    // WebSocket 이벤트 리스너 등록
    on('message', (data: SocketMessage) => {
      setMessage(data.message);
    });

    on('notification', (data: SocketMessage) => {
      Alert.alert('알림', data.message);
    });

    // 컴포넌트 언마운트 시 정리는 useWebSocket에서 처리
  }, [on]);

  const handleSendMessage = (): void => {
    emit('test-message', { message: 'Hello from React Native!' });
  };

  const handleApiCall = async (): Promise<void> => {
    try {
      const response = await ApiService.get('/api/test');
      Alert.alert('API 응답', JSON.stringify(response));
    } catch (error) {
      Alert.alert('API 오류', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OnCare 앱</Text>
      
      {message ? (
        <Text style={styles.message}>받은 메시지: {message}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
        <Text style={styles.buttonText}>WebSocket 테스트</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleApiCall}>
        <Text style={styles.buttonText}>API 테스트</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate(ROUTES.CHAT as keyof RootStackParamList)}>
        <Text style={styles.buttonText}>채팅으로 이동</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e1f5fe',
    borderRadius: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200EA',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;