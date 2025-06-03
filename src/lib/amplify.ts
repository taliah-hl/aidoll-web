// src/lib/amplify.ts
import { Amplify } from 'aws-amplify';
import Auth from 'aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '5i5kvtgkdn9tju9q2uu660ifm2',
      userPoolId: 'ap-southeast-2_mpPRbynoC',
      loginWith: { // Optional
        oauth: {
          // domain: 'abcdefghij1234567890-29051e27.auth.us-east-1.amazoncognito.com','https://ap-southeast-2mpprbynoc.auth.ap-southeast-2.amazoncognito.com'
          domain: 'https://ap-southeast-2mpprbynoc.auth.ap-southeast-2.amazoncognito.com',
          scopes: ['openid','email','phone','profile','aws.cognito.signin.user.admin'],
          redirectSignIn: ['http://localhost:3000/','https://example.com/'],
          redirectSignOut: ['http://localhost:3000/','https://example.com/'],
          responseType: 'code',
        },
        username: true,
        email: false, // Optional
        phone: false, // Optional
      }
    }
  }
});


export { Auth };
