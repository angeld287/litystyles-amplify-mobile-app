import React from 'react';
import * as Font from 'expo-font';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import { Icon } from 'galio-framework';
import { Icon as I} from 'native-base';

import argonConfig from '../assets/config/argon.json';
const ArgonExtra = require('../assets/font/argon.ttf');
const IconArgonExtra = createIconSetFromIcoMoon(argonConfig, 'ArgonExtra');

class IconExtra extends React.Component {
  state = {
    fontLoaded: false,
  }

  async componentDidMount() {
    await Font.loadAsync({ ArgonExtra: ArgonExtra });
    this.setState({ fontLoaded: true });
  }

  render() {
    const { name, family, color, size, ...rest } = this.props;
    
    if (name && family && this.state.fontLoaded) {
      if (family === 'ArgonExtra') {
        return <IconArgonExtra name={name} family={family} color={color} size={size} {...rest} />;
      }
      if (family === 'MaterialCommunityIcons' || family === 'MaterialIcons') {
        return <I style={{fontSize: size, color: color}} name={name} type={family} {...rest} />;
      }
      return <Icon name={name} family={family} color={color} size={size} {...rest} />;
    }

    return null;
  }
}

export default IconExtra;
