import React, { useState, useEffect } from 'react';
import {View,} from 'react-native';
import SelectPetUI from './selectPetUI';

const SelectPetComponent = ({navigation, route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [selectedPName, set_selectedPName] = useState(undefined);

     useEffect(() => {
        set_petsArray(props.petsArray);
        set_selectedIndex(props.selectedIndex);
        set_selectedPName(props.selectedPName);
    }, [props.petsArray,props.selectedIndex,props.selectedPName]);

    const selectPetAction = (item) => {
        props.selectPetAction(item);
    };

    return (
        <SelectPetUI 
            petsArray = {petsArray}
            selectedIndex = {selectedIndex}
            selectedPName = {selectedPName}
            selectPetAction = {selectPetAction}
        />
    );

  }
  
  export default SelectPetComponent;