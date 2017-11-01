package com.replayapp;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.bugsnag.BugsnagReactNative;
import com.oblador.vectoricons.VectorIconsPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.horcrux.svg.SvgPackage;
import com.github.yamill.orientation.OrientationPackage;
import io.fullstack.oauth.OAuthManagerPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.horcrux.svg.SvgPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import io.fullstack.oauth.OAuthManagerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            BugsnagReactNative.getPackage(),
            new VectorIconsPackage(),
            new ReactVideoPackage(),
            new SvgPackage(),
            new OrientationPackage(),
            new OAuthManagerPackage(),
            new MapsPackage(),
            new ReactNativeConfigPackage(),
            new OrientationPackage(),
            new SvgPackage(),
            new MapsPackage(),
            new ReactVideoPackage(),
            new ReactNativeConfigPackage(),
            new OAuthManagerPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
