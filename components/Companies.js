import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, View, ActivityIndicator } from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { API, graphqlOperation } from 'aws-amplify';
import { Block, theme } from 'galio-framework';

import { listOffices } from '../graphql/queries';

import { Card } from '.';
const { width } = Dimensions.get('screen');

const Companies = (props) => {

const [ offices, setOffices ] = useState(null);
const [ loading, setLoading ] = useState(true);

const completedData = useCallback(
    async () => {
      try {
        var officesApi = null;
        var o = [];
        const _o = [];

        officesApi = await API.graphql(graphqlOperation(listOffices, {filter: { deleted: {ne: true} } } ) );

        o = officesApi.data.listOffices.items;
        
        return o;

      } catch (e) {
         console.log(e); 
         return [];
      }
    },
    [],
);
  

useEffect(() => {
    setLoading(true);
    async function fetchData() {
        try {
            var o = [];
            o = await completedData();
            setOffices(o)
            setLoading(false)
        } catch (e) {
            setLoading(false);
            console.log(e);
        }
    }
    fetchData();
}, [completedData]);


const _offices = (!loading && offices !== null)?([].concat(offices)
		.filter((e) => {
            if(props.isBarber){
               return e.categoryId === "e6e234a7-e4b8-4fef-bde5-57458a79a3d3"
            }else{
               return e.categoryId === "af30aeb8-5b6b-433e-a6f0-57004bc7c26b"
            }
        })
		.map((item,i)=>
			{      
                var office = {
                    title: item.name,
                    image: item.image,
                    cta: 'Entrar', 
                    horizontal: true
                };
                console.log(props.isBarber);
                switch (i) {
                    case 0:
                        return (<Card key={i} item={office} horizontal  />)
                    case 1:
                        var office_2 = {
                            title: offices[i+1].name,
                            image: offices[i+1].image,
                            cta: 'Entrar', 
                            horizontal: true
                        };
                        return (<Block flex row><Card key={i} item={office}  style={{ marginRight: theme.SIZES.BASE }}  /><Card key={i+1} item={office_2} /></Block>)
                    case 2:
                        break
                    case 3:
                        return (<Card key={i} item={office} horizontal  />)
                    case 4:
                        return (<Card key={i} item={office} full  />)
                    default:
                        return (<Card key={i} item={office} horizontal  />);
                }

            }

        )):(<Card></Card>)

return (
    <Block flex>
      {loading &&
        <View >
           <ActivityIndicator size="large" color="#0000ff" />
        </View>
      }
      {!loading && _offices}

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
