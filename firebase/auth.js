// FirebaseUI config.
var firebaseAuthUiConfig = {
  autoUpgradeAnonymousUsers: true,
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  tosUrl: './terms-of-service.html',
  privacyPolicyUrl: './privacy-policy.html',
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      console.log('signed in')
      return false;
    }
  }
};

var firebaseAuthUi = new firebaseui.auth.AuthUI(firebase.auth());
