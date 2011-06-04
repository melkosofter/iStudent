//
//  AppDelegate.h
//  iStudent
//
//  Created by X-Hunter on 18.05.11.
//  Copyright Flux 2011. All rights reserved.
//

#import <UIKit/UIKit.h>
#ifdef PHONEGAP_FRAMEWORK
	#import <PhoneGap/PhoneGapDelegate.h>
#else
	#import "PhoneGapDelegate.h"
#endif

@interface AppDelegate : PhoneGapDelegate {
}

@end

