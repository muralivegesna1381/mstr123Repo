import React, { useState, useEffect } from 'react';
import SelectPetUI from './selectPetUI';

const SelectPetComponent = ({navigation, route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [selectedPName, set_selectedPName] = useState(undefined);
    const [isKeboard, set_isKeboard] = useState(undefined);

     useEffect(() => {
        set_petsArray(props.petsArray);
        set_selectedIndex(props.selectedIndex);
        set_isKeboard(props.isKeboard);
        set_selectedPName(props.selectedPName);
    }, [props.petsArray,props.selectedIndex,props.isKeboard,props.selectedPName]);

    const selectPetAction = (item) => {
        props.selectPetAction(item);
    };

    return (
        <SelectPetUI 
            petsArray = {petsArray}
            selectedIndex = {selectedIndex}
            selectedPName = {selectedPName}
            isKeboard = {isKeboard}
            selectPetAction = {selectPetAction}
        />
    );

  }
  
  export default SelectPetComponent;