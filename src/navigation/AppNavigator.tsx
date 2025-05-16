import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Home/HomeScreen';
// import ChatScreen from '../screens/Chat/ChatScreen';
// import ProfileScreen from '../screens/Profile/ProfileScreen';
import { ROUTES, RouteNames } from '../constants/config';

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = (): React.JSX.Element => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.HOME as keyof RootStackParamList}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200EA',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen 
          name={ROUTES.HOME as keyof RootStackParamList}
          component={HomeScreen}
          options={{ title: 'OnCare' }}
        />
        {/* <Stack.Screen 
          name={ROUTES.CHAT as keyof RootStackParamList}
          component={ChatScreen}
          options={{ title: '채팅' }}
        />
        <Stack.Screen 
          name={ROUTES.PROFILE as keyof RootStackParamList}
          component={ProfileScreen}
          options={{ title: '프로필' }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;