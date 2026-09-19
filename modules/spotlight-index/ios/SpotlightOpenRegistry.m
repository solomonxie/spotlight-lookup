#import "SpotlightOpenRegistry.h"

@implementation SpotlightOpenRegistry {
  NSLock *_lock;
  NSString *_pendingIdentifier;
}

+ (SpotlightOpenRegistry *)shared
{
  static SpotlightOpenRegistry *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [SpotlightOpenRegistry new];
  });
  return shared;
}

+ (NSNotificationName)openNotification
{
  return @"SpotlightLookup.open";
}

- (instancetype)init
{
  if (self = [super init]) {
    _lock = [NSLock new];
  }
  return self;
}

- (void)deliver:(NSString *)identifier
{
  [_lock lock];
  _pendingIdentifier = identifier;
  [_lock unlock];

  [[NSNotificationCenter defaultCenter] postNotificationName:SpotlightOpenRegistry.openNotification
                                                      object:nil
                                                    userInfo:@{@"id" : identifier}];
}

- (NSString *)take
{
  [_lock lock];
  NSString *identifier = _pendingIdentifier;
  _pendingIdentifier = nil;
  [_lock unlock];
  return identifier;
}

@end
