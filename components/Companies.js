import React from 'react';
import { StyleSheet, Dimensions, View, ActivityIndicator } from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { Block, theme } from 'galio-framework';

import { Card } from '.';
const { width } = Dimensions.get('screen');

const Companies = (props) => {

const _offices = (!props.loading && props.offices !== null)?([].concat(props.offices)
		.map((item,i)=>
			{      
                var office = {
                    id: item.id,
                    title: item.name,
                    image: item.image,
                    cta: 'Entrar', 
                    horizontal: true,
                    supplier: props.supplier
                };
                switch (i) {
                    case 0:
                        return (<Card {...props} key={i} item={office} horizontal  />)
                    case 1:
                        if(props.offices.length > 2){
                          var office_2 = {
                              id: props.offices[i+1].id,
                              title: props.offices[i+1].name,
                              image: props.offices[i+1].image,
                              cta: 'Entrar', 
                              horizontal: true,
                              supplier: props.supplier
                          };
                          return (<Block flex row><Card {...props} key={i} item={office}  style={{ marginRight: theme.SIZES.BASE }}  /><Card {...props} key={i+1} item={office_2} /></Block>)
                        }else{
                          return (<Card {...props} key={i} item={office} horizontal  />)
                        }
                        
                    case 2:
                        break
                    case 3:
                        return (<Card {...props} key={i} item={office} horizontal  />)
                    case 4:
                        return (<Card {...props} key={i} item={office} full  />)
                    default:
                        return (<Card {...props} key={i} item={office} horizontal  />);
                }

            }

        )):(<Card></Card>)

return (
    <Block flex>
      {props.loading &&
        <View style={{marginTop: 40}}>
           <ActivityIndicator size="large" color="#0000ff" />
        </View>
      }
      {!props.loading && _offices}

    </Block>
 );
}

const styles = StyleSheet.create({
  companies: {
    width: width,    
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

export default withNavigation(Companies);
