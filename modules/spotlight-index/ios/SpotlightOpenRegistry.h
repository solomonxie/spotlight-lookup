#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Holds the identifier of a Spotlight result tapped before JavaScript was ready.
/// The scene delegate delivers into it; the module drains it and forwards later taps.
@interface SpotlightOpenRegistry : NSObject

@property (class, nonatomic, readonly) SpotlightOpenRegistry *shared;

/// Posted with a `id` key in `userInfo` whenever a result is opened.
@property (class, nonatomic, readonly) NSNotificationName openNotification;

- (void)deliver:(NSString *)identifier;
- (nullable NSString *)take;

@end

NS_ASSUME_NONNULL_END
