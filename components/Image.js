import React, {useEffect , useCallback, useState} from 'react';
import { withNavigation } from '@react-navigation/compat';
import PropTypes from 'prop-types';
import { Storage } from 'aws-amplify';
import { Thumbnail } from 'react-native';
import defaultImage from  '../images/default-image.png';

const Image = (props) => {
  
    const { image } = props;

    const [ _image , setImage ] = useState('')
    const [ loading , setLoading ] = useState(true)

    const getImageFromStorage = useCallback(
      async (image) => {
        try {
          if(image !== null) {
              var i = await Storage.get(image, { level: 'public' });
              return i
          }else{
              return defaultImage;
          }
        } catch (e) {
            console.log(e); 
            return defaultImage;
        }
      },
      [],
    );

    useEffect(() => {
      async function fetchData() {
          try {
            setLoading(true)
            const img = await getImageFromStorage(image);
            setImage(img);
            setLoading(false);
          } catch (e) {
            console.log(e);
            setLoading(false);
          }
      }
      fetchData();
    }, [getImageFromStorage]);

    return (<Thumbnail source={{uri: _image}} />);
  
}

export default Image;