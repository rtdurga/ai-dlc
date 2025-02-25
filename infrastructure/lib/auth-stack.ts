import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly identityPool: cognito.CfnIdentityPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create User Pool
    this.userPool = new cognito.UserPool(this, 'GeoCell-UserPool', {
      userPoolName: 'geocell-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        phone: true,
        username: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        },
        phoneNumber: {
          required: false,
          mutable: true
        }
      },
      customAttributes: {
        organization: new cognito.StringAttribute({ mutable: true }),
        role: new cognito.StringAttribute({ mutable: true })
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: {
        sms: true,
        otp: true
      },
      userVerification: {
        emailSubject: 'Verify your email for GeoCell Intelligence Platform',
        emailBody: 'Thanks for signing up! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Thanks for signing up! Your verification code is {####}'
      }
    });

    // 2. Configure MFA
    this.userPool.addClient('GeoCell-App-Client', {
      userPoolClientName: 'geocell-app',
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE
        ],
        callbackUrls: ['http://localhost:3000/callback'], // Update with actual URLs
        logoutUrls: ['http://localhost:3000/logout']
      },
      enableTokenRevocation: true,
      preventUserExistenceErrors: true
    });

    // 3. Create Identity Pool
    this.identityPool = new cognito.CfnIdentityPool(this, 'GeoCell-IdentityPool', {
      identityPoolName: 'geocell_identity_pool',
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: this.userPoolClient.userPoolClientId,
        providerName: this.userPool.userPoolProviderName,
        serverSideTokenCheck: true
      }]
    });

    // 4. Set up IAM roles for authenticated users
    const authenticatedRole = new iam.Role(this, 'CognitoAuthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated'
          }
        },
        'sts:AssumeRoleWithWebIdentity'
      )
    });

    // 5. Attach roles to Identity Pool
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn
      }
    });

    // 6. Output values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref
    });
  }
}
