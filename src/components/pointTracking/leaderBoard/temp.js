{leaderBoardArray && leaderBoardArray.length > 0 ? <View style={Platform.isPad ? [styles.middleComStyle, {width:wp('85%'),}] : [styles.middleComStyle]}>
          <View style={{flexDirection:'row',width:wp('90%'),minHeight:hp('18%'),alignItems:'center',justifyContent:'space-between'}}>

            {leaderBoardArray && leaderBoardArray.length > 1 ? <View style={{}}>

              {leaderBoardArray[1].petPhotoUrl ? <ImageBackground source={{uri:leaderBoardArray[1].petPhotoUrl}} onLoadStart={() => set_imgLoaderLeft(true)} onLoadEnd={() => {
                  set_imgLoaderLeft(false)}} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad,{marginLeft:wp('5%')}] : [styles.leaderBoardPetStyle,{}]} imageStyle={{ borderRadius: 100,borderColor:'#1ce7f2',borderWidth:3 }}>
                {imgLoaderLeft ? <View style={{alignItems:'center',justifyContent:'center',flex:1}}>{enableLoader ? <ActivityIndicator size="large" color="gray"/> : null}</View> : null}
                <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%')}] : [styles.rankViewStyle]}>
                  <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{leaderBoardArray[1].rank}</Text>
                </View>
              </ImageBackground> : 

              <ImageBackground source={defaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad,{marginLeft:wp('5%')}] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100,borderColor:'#1ce7f2',borderWidth:3 }}>
                <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%')}] : [styles.rankViewStyle]}>
                  <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{leaderBoardArray[1].rank ? leaderBoardArray[1].rank : ''}</Text>
                </View>
              </ImageBackground>}
                
              <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                <Text style={Platform.isPad ? [styles.petNameStyle,{textTransform: 'uppercase',marginLeft:wp('5%')}] : [styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length>0 ? (leaderBoardArray[1].petName.length > 12 ? leaderBoardArray[1].petName.slice(0,12)+'...' : leaderBoardArray[1].petName) : ''}</Text>
                <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length>0 ? leaderBoardArray[1].points : ''}</Text>
              </View>
              </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

            {leaderBoardArray && leaderBoardArray.length > 0 ? <View style={{alignItems:'center'}}>
              {leaderBoardArray[0].petPhotoUrl ? <ImageBackground catche={'only-if-cached'} source={{uri:leaderBoardArray[0].petPhotoUrl}} onLoadStart={() => set_imgLoaderMiddle(true)} onLoadEnd={() => {
                  set_imgLoaderMiddle(false)}} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad1,{marginTop:wp('-3%')}] : [styles.leaderBoardPetStyle,{width:wp('23%'),marginTop:wp('-3%'),}]} imageStyle={{ borderRadius: 100,borderColor:'#1ef29c',borderWidth:3 }}>
                {imgLoaderMiddle ? <View style={{alignItems:'center',justifyContent:'center',flex:1}}>{enableLoader ? <ActivityIndicator size="large" color="gray"/> : null}</View> : null}
                  <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%')}] : [styles.rankViewStyle]}>
                    <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{leaderBoardArray[0].rank}</Text>
                  </View>
              </ImageBackground> :

              <ImageBackground source={defaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad] : [styles.leaderBoardPetStyle,{width:wp('25%'),marginTop:wp('-5%'),}]} imageStyle={{ borderRadius: 100,borderColor:'#1ef29c',borderWidth:3 }}>
                <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%')}] : [styles.rankViewStyle]}>
                  <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{leaderBoardArray[0].rank ? leaderBoardArray[0].rank : ''}</Text>
                </View>
              </ImageBackground>
                
              }
              <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length>0 ? (leaderBoardArray[0].petName.length > 12 ? leaderBoardArray[0].petName.slice(0,12)+'...' : leaderBoardArray[0].petName) : ''}</Text>
                <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length>0 ? leaderBoardArray[0].points : ''}</Text>
              </View>
                
              </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

             {leaderBoardArray && leaderBoardArray.length > 2 ? <View style={{alignItems:'center'}}>
                {leaderBoardArray[2].petPhotoUrl ? <ImageBackground catche={'only-if-cached'} source={{uri : leaderBoardArray[2].petPhotoUrl}} onLoadStart={() => set_imgLoaderRight(true)} onLoadEnd={() => {
                          set_imgLoaderRight(false)}} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad,{marginRight:wp('5%')}] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100,borderColor:'#feff06',borderWidth:3 }}>
                            {imgLoaderRight ? <View style={{alignItems:'center',justifyContent:'center',flex:1}}>{enableLoader ? <ActivityIndicator size="large" color="gray"/> : null}</View> : null}
                            <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%'),}] : [styles.rankViewStyle]}>
                                <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{leaderBoardArray[2].rank}</Text>
                            </View>
                </ImageBackground> :
                
                <ImageBackground source={defaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100,borderColor:'#feff06',borderWidth:3 }}>
                  <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%')}] : [styles.rankViewStyle]}>
                    <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{leaderBoardArray[2].rank ? leaderBoardArray[2].rank : ''}</Text>
                  </View>
                </ImageBackground>}
                <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                  <Text style={Platform.isPad ? [styles.petNameStyle,{textTransform: 'uppercase',marginRight:wp('5%')}] : [styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length>0 ? (leaderBoardArray[2].petName.length > 12 ? leaderBoardArray[2].petName.slice(0,12)+'...' : leaderBoardArray[2].petName) : ''}</Text>
                  <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length>0 ? leaderBoardArray[2].points : ''}</Text>
                </View>
              </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

            </View>

          </View> : <View style={styles.middleComStyle}>
            
              <View style={{alignItems:'center',flexDirection:'row',flexDirection:'row',width:wp('90%'),minHeight:hp('18%'),alignItems:'center',justifyContent:'space-between'}}>

                <View style={{marginRight:wp('2%')}}>
                    <ImageBackground source={defaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad,{marginLeft:wp('5%')}] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100,borderColor:'#1ce7f2',borderWidth:3 }}>
                      <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%')}] : [styles.rankViewStyle]}>
                          <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle,{color:'grey'}]}>{'2'}</Text>
                      </View>
                    </ImageBackground>
                    
                    <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                      <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                      <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'--'}</Text>
                    </View>
                </View>

                <View style={{marginRight:wp('2%')}}>
                    <ImageBackground source={defaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad1,{marginTop:wp('-3%')}] : [styles.leaderBoardPetStyle,{width:wp('23%'),marginTop:wp('-5%'),}]} imageStyle={{ borderRadius: 100,borderColor:'#1ce7f2',borderWidth:3 }}>
                      <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%')}] : [styles.rankViewStyle]}>
                          <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle,{color:'grey'}]}>{'1'}</Text>
                      </View>
                    </ImageBackground>
                    
                    <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                      <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                      <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'--'}</Text>
                    </View>
                </View>

                <View >
                    <ImageBackground source={defaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad,{marginRight:wp('5%')}] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100,borderColor:'#1ce7f2',borderWidth:3 }} resizeMode='contain'>
                      <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('6%')}] : [styles.rankViewStyle]}>
                          <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle,{color:'grey'}]}>{'3'}</Text>
                      </View>
                    </ImageBackground>
                    
                    <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                      <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                      <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'----'}</Text>
                    </View>
                </View>

              </View>
            </View>}






<View style={styles.bottomView}>

{!isPetInTop && leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? <TouchableOpacity style={styles.bottomComStyle} onPress={async () => {rewardPointsBtnAction();}}>

  <ImageBackground style={[styles.rewardBackImgStyle]} imageStyle={{borderTopLeftRadius:5,borderTopRightRadius:5}} source={require("../../../../assets/images/pointTracking/png/ptGradientImg.png")}>
  <View style={{width:wp('65%'),flexDirection:'row',justifyContent:'space-between',}}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
            <View >
              {leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 && leaderBoardCurrent.petPhotoUrl && leaderBoardCurrent.petPhotoUrl!=="" ? 
              <ImageBackground style={Platform.isPad ? [styles.rewardImgStyle,{width:wp('7%')}]: [styles.rewardImgStyle]} imageStyle={{borderRadius:100, borderColor:'black',borderWidth:2 }} source={{uri: leaderBoardCurrent.petPhotoUrl}}></ImageBackground>
               : <ImageBackground style={styles.rewardImgStyle} imageStyle={{borderRadius:100, borderColor:'black',borderWidth:2 }} source={defaultPetImg}></ImageBackground>}

            </View>
            <View style={{marginLeft:wp('4%'),justifyContent:'center'}}>
                    <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? leaderBoardCurrent.petName.length > 20 ? leaderBoardCurrent.petName.slice(0, 20) + "..." : leaderBoardCurrent.petName : ''}</Text>
                    <Text style={styles.rewardPointsStyle}>{leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? leaderBoardCurrent.points : ''}</Text>
            </View>
        </View>
        <View style={{alignContent:"center",justifyContent:'center'}}>
            
          <Image style={[styles.rewardImgArrowStyle]} source={require("../../../../assets/images/otherImages/svg/rightArrowBlack.svg")}></Image>
          
        </View>
    </View>
  </ImageBackground>

</TouchableOpacity>
:
<TouchableOpacity style={styles.bottomComStyle} onPress={async () => {
  rewardPointsBtnAction();
}}>

<ImageBackground style={[styles.rewardBackImgStyle]} imageStyle={{borderTopLeftRadius:5,borderTopRightRadius:5}} source={require("../../../../assets/images/pointTracking/png/ptGradientImg.png")}>
    <View style={{width:wp('55%'),flexDirection:'row',justifyContent:'space-evenly',alignItems:'center'}}>
      <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{'Reward Points'}</Text>
      <View style={{justifyContent:'flex-end'}}>
          <Image style={[styles.rewardImgArrowStyle]} source={require("../../../../assets/images/otherImages/svg/rightArrowBlack.svg")}></Image>              
      </View>
    </View>
</ImageBackground>
  
</TouchableOpacity>
}


</View>