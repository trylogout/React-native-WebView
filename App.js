import React from 'react';
import { WebView } from 'react-native-webview';
import { BackHandler, Platform, Linking, PermissionsAndroid } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import appsFlyer from 'react-native-appsflyer';

var RNFS = require('react-native-fs'); // ReactNativeFileSystem(RNFS)
var path = RNFS.DocumentDirectoryPath + '/UUID.dat'; // File with UID from AppsFlyer
var _cuid = "NOID"; // NOID - for dev
var connectionStatus = null; // To have connection status from any part of app.js
var TconnectionStatus = null; // Temp connection status
var TExtUrl = null; // external link opening

/** Write Html as string to block access to edit it for users **/
var HTMLText = `<!DOCTYPE html>
<html lang="en">

<head> </head>

<body>
    <div id="main">
        <div class="fof">
            <h4>OOPS ...</h4>
            <br />
            <h4>Check</h4>
            <h5>Internet Connection</h5>
        </div>
    </div>
</body>

<style>
    * {
        transition: all 0.6s;
    }
    
    html {
        height: 100%;
    }
    
    body {
        font-family: "Lato", sans-serif;
        color: #888;
        margin: 0;
    }
    
    #main {
        display: table;
        width: 100%;
        height: 100vh;
        text-align: center;
    }
    
    .fof {
        display: table-cell;
        vertical-align: middle;
    }
    
    .fof h4 {
        padding-left: 12px;
        font-size: 25px;
        display: inline-block;
    }
    
    .fof h5 {
        padding-top: -25px;
        font-size: 25px;
        display: inline-block;
        padding-right: 12px;
        animation: type 0.5s alternate infinite;
    }
    
    @keyframes type {
        from {
            box-shadow: inset -3px 0px 0px #888;
        }
        to {
            box-shadow: inset -3px 0px 0px transparent;
        }
    }
    
    .button {
        width: 400px;
        height: 100px;
        background: #888;
        margin-bottom: 25px;
        border-radius: 32px;
        text-align: center;
        cursor: pointer;
        transition: all 0.1s ease-in-out;
    }
    
    .box {
        position: absolute;
        top: 80%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    
    .btn:link,
    .btn:visited {
        text-decoration: none;
        text-transform: uppercase;
        position: relative;
        top: 0;
        left: 0;
        padding: 20px 40px;
        border-radius: 100px;
        display: inline-block;
        transition: all .5s;
    }
    
    .btn-white {
        background: #888;
        color: #fff;
    }
    
    .btn:hover {
        box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.2);
        transform: translateY(-3px);
    }
    
    .btn-bottom-animation-1 {
        animation: comeFromBottom 1s ease-out .8s;
    }
    
    .btn::after {
        content: "";
        text-decoration: none;
        text-transform: uppercase;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        border-radius: 100px;
        display: inline-block;
        z-index: -1;
        transition: all .5s;
    }
    
    .btn-white::after {
        background: #888;
    }
    
    .btn-animation-1:hover::after {
        transform: scaleX(1.4) scaleY(1.6);
        opacity: 0;
    }
    
    @keyframes comeFromBottom {
        0% {
            opacity: 0;
            transform: translateY(40px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>

</html>`

/** AppsFlyerSDK setup Start **/
// eslint-disable-next-line no-unused-vars
var onInstallConversionDataCanceller = appsFlyer.onInstallConversionData(
    (res) => {
        console.log('onInstallConversionData: ' + JSON.stringify(res));
        if (res.type === 'onInstallConversionSuccess') {
            if (JSON.parse(res.data.is_first_launch) === true) {
                if (res.data.af_status === 'Non-organic') {
                    var media_source = res.data.media_source;
                    var campaign = res.data.campaign;
                    console.log(
                        'This is first launch and a Non-Organic install. Media source: ' +
                        media_source +
                        ' Campaign: ' +
                        campaign,
                    );
                } else if (res.data.af_status === 'Organic') {
                    console.log('This is first launch and a Organic Install');
                }
            } else {
                console.log('This is not first launch');
            }
        }
    },
);

// eslint-disable-next-line no-unused-vars
var onAppOpenAttributionCanceller = appsFlyer.onAppOpenAttribution((res) => {
    console.log(res);
});

appsFlyer.initSdk({
        isDebug: true,
        devKey: 'devKey ',
        appId: 'appID',
        timeToWaitForAdvertiserID: 60,
    },
    (result) => {
        console.log('initSdk: ' + result);
    },
    (error) => {
        console.error('initSdk: ' + error);
    },
);

appsFlyer.getAppsFlyerUID(function(err, uid) {
    _cuid = uid;
});
/** AppsFlyerSDK setup End **/

export default class App extends React.Component {
        constructor(props) {
            super(props);
        }
        webView = {
            canGoBack: false,
            url: 'https://2youapp.work/md/testred?did=',
            ref: null,
            first_call: true,
            redirectable_url: "2youapp.work/md",
            uid: "",
        }

        /** Force a render without state change **/
        updateRender() {
            this.forceUpdate();
        }; //updateRender

        /** For Loading And Back Button Press **/
        onAndroidBackPress = () => {
            if (this.webView.canGoBack && this.webView.ref && TconnectionStatus) {
                this.webView.ref.goBack();
                return true;
            }
            return false;
        }; //onAndroidBackPress

        /** Check component on mounted **/
        componentDidMount() {
            if (Platform.OS === 'android') {
                BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
            }
            //Create Listener to check connection every 2sec
            setInterval(() => {
                NetInfo.addEventListener(this.handleConnectivityChange);
            }, 2000);
        }; //componentDidMount

        handleConnectivityChange = state => {
            TconnectionStatus = connectionStatus;
            if (connectionStatus != state.isConnected) {
                connectionStatus = state.isConnected
                if (TconnectionStatus !== null && state.isConnected) {
                    // We need setTimeout to waiting connection established
                    // Without it we will have err_code::-6
                    setTimeout(() => { this.updateRender(); }, 5000);
                } else { this.updateRender(); }
            }
        }; //handleConnectivityChange

        _onRefresh = () => {
            this.setState({ refreshing: true });
            this.webView.ref.reload();
            this.setState({ refreshing: false });
        }; //_onRefresh

        /** Get user details from AppsFlyer **/
        async getUserDetails() {
            this.isLoading = true;
            try {
                await appsFlyer.getAppsFlyerUID(function(err, uid) {
                        _cuid = uid;
                    })
                    .then(response => {
                        this.isLoading = false;
                    })
                    .catch(error => {
                        console.log(error);
                        this.error = error
                    })
            } catch (e) {
                console.log('ERROR', e);
                this.isLoading = false;
            }
        }; //getUserDetails

        /** Waiting user details information and write it **/
        async getUser() {
            await this.getUserDetails();
            await this.writeData();
        }; //getUser

        /** Write and read Data **/
        writeData() {
            RNFS.writeFile(path, _cuid, 'utf8')
                .then((success) => {
                    console.log('FILE WRITTEN!');
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }; //writeData

        async readData() {
            await RNFS.readFile(path, 'utf8')
                .then((readresult) => {
                    console.log(readresult);
                    if (readresult != '') {
                        console.log("ID getted from file")
                        _cuid = readresult;
                    }
                })
                .catch((err) => {
                    console.log('ERROR' + err.message);
                })
        }; //readData

        askPermission = () => {
            var that = this;
            async function requestCameraPermission() {
                //Calling the permission function
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA, {
                        title: 'App Camera Permission',
                        message: 'BeNaughty needs access to your camera ',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    that.proceed();
                } else {
                    alert('CAMERA Permission Denied.');
                }
            }
            //Checking for the permission just after component loaded
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then(response => {
                if (response === false) {
                    requestCameraPermission();
                }
            })
        }; //askPermisiion

        /** For Loading And Back Button Press**/
        render() {
                this.askPermission();
                if (connectionStatus === null) {
                    return ( < WebView source = {
                            { html: '' }
                        }
                        /> )
                    }
                    if (connectionStatus) {
                        this.readData();

                        if (_cuid != "NOID") {
                            this.getUser();
                        }

                        if (!this.webView.url.includes(_cuid)) {
                            this.webView.url = this.webView.url + _cuid;
                        }

                        return ( <
                            WebView ref = {
                                (webView) => { this.webView.ref = webView; }
                            }

                            onNavigationStateChange = {
                                (navState) => { this.webView.canGoBack = navState.canGoBack; }
                            }

                            onNavigationStateChange = {
                                (navState) => { this.webView.canGoBack = navState.canGoBack; },
                                (event) => {
                                    this.webView.canGoBack = event.canGoBack;
                                    if (!event.url.includes('about:blank') && this.webView.first_call && !event.url.includes('2youapp.work/md') && !event.url.includes(this.webView.redirectable_url) && !event.url.includes('hotclick.icu')) {
                                        this.webView.first_call = false;
                                        this.webView.redirectable_url = event.url.replace("https://", "");
                                        this.webView.redirectable_url = this.webView.redirectable_url.replace("http://", "");
                                        this.webView.redirectable_url = this.webView.redirectable_url.replace("www.", "");
                                        this.webView.redirectable_url = this.webView.redirectable_url.replace("m.", "");
                                    }

                                    if (event.url.includes('about:blank')) {
                                        this.webView.ref.goForward();
                                    }

                                    if (!event.url.includes('about:blank') && !event.url.includes('2youapp.work/md') && !event.url.includes(this.webView.redirectable_url) && !event.url.includes('hotclick.icu')) {
                                        if (event.url !== TExtUrl) {
                                            console.log("Opening external URL: " + event.url)
                                            this.webView.ref.goBack();
                                            if (Linking.canOpenURL(event.url)) {
                                                Linking.openURL(event.url);
                                                TExtUrl = event.url;
                                            } else {
                                                console.log("Don't know how to open URI: " + event.url)
                                            }
                                        }
                                    }
                                }
                            }

                            source = {
                                { uri: this.webView.url }
                            }
                            javaScriptEnabled = { true }
                            domStorageEnabled = { true }
                            cacheEnabled = { true }
                            thirdPartyCookiesEnabled = { true }
                            />
                        )
                    } else {
                        return ( < WebView source = {
                                { html: HTMLText }
                            }
                            originWhitelist = {
                                ['*']
                            }
                            /> )
                        }
                    }
                }