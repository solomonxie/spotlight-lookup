#import "SpotlightIndex.h"
#import "SpotlightOpenRegistry.h"

#import <CoreSpotlight/CoreSpotlight.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

#import <SpotlightIndexSpec/SpotlightIndexSpec.h>

static NSString *const kOpenEvent = @"onSpotlightOpen";

static void SettlePromise(RCTPromiseResolveBlock resolve, RCTPromiseRejectBlock reject, NSError *error)
{
  if (error) {
    reject(@"ERR_SPOTLIGHT_INDEX", error.localizedDescription, error);
  } else {
    resolve(nil);
  }
}

static CSSearchableItem *MakeSearchableItem(NSDictionary *item)
{
  CSSearchableItemAttributeSet *attributes =
      [[CSSearchableItemAttributeSet alloc] initWithContentType:UTTypeText];
  NSString *title = item[@"title"];
  attributes.identifier = item[@"id"];
  attributes.title = title;
  attributes.displayName = title;

  NSMutableArray<NSString *> *description = [NSMutableArray new];
  for (NSString *key in @[ @"subtitle", @"body" ]) {
    NSString *value = item[key];
    if ([value isKindOfClass:NSString.class] && value.length > 0) {
      [description addObject:value];
    }
  }
  attributes.contentDescription = [description componentsJoinedByString:@"\n"];

  NSArray<NSString *> *keywords = item[@"keywords"];
  if ([keywords isKindOfClass:NSArray.class] && keywords.count > 0) {
    attributes.keywords = keywords;
    attributes.alternateNames = keywords;
  }

  CSSearchableItem *searchableItem =
      [[CSSearchableItem alloc] initWithUniqueIdentifier:item[@"id"]
                                        domainIdentifier:item[@"domain"]
                                            attributeSet:attributes];
  // Without this iOS drops the item from the index after a month of no interaction.
  searchableItem.expirationDate = NSDate.distantFuture;
  return searchableItem;
}

@interface SpotlightIndex () <NativeSpotlightIndexSpec>
@property (nonatomic, assign) BOOL hasListeners;
@end

@implementation SpotlightIndex {
  id _openObserver;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[ kOpenEvent ];
}

- (void)startObserving
{
  self.hasListeners = YES;
  __weak __typeof(self) weakSelf = self;
  _openObserver = [NSNotificationCenter.defaultCenter
      addObserverForName:SpotlightOpenRegistry.openNotification
                  object:nil
                   queue:NSOperationQueue.mainQueue
              usingBlock:^(NSNotification *notification) {
                SpotlightIndex *strongSelf = weakSelf;
                NSString *identifier = notification.userInfo[@"id"];
                if (identifier && strongSelf.hasListeners) {
                  [strongSelf sendEventWithName:kOpenEvent body:@{@"id" : identifier}];
                }
              }];
}

- (void)stopObserving
{
  self.hasListeners = NO;
  if (_openObserver) {
    [NSNotificationCenter.defaultCenter removeObserver:_openObserver];
    _openObserver = nil;
  }
}

- (NSNumber *)isAvailable
{
  return @(CSSearchableIndex.isIndexingAvailable);
}

- (NSString *)takePendingOpen
{
  return SpotlightOpenRegistry.shared.take ?: @"";
}

- (void)indexItems:(NSArray *)items
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  NSMutableArray<CSSearchableItem *> *searchable = [NSMutableArray arrayWithCapacity:items.count];
  for (NSDictionary *item in items) {
    [searchable addObject:MakeSearchableItem(item)];
  }
  [CSSearchableIndex.defaultSearchableIndex indexSearchableItems:searchable
                                               completionHandler:^(NSError *error) {
                                                 SettlePromise(resolve, reject, error);
                                               }];
}

- (void)deleteItems:(NSArray *)ids
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  [CSSearchableIndex.defaultSearchableIndex
      deleteSearchableItemsWithIdentifiers:ids
                         completionHandler:^(NSError *error) {
                           SettlePromise(resolve, reject, error);
                         }];
}

- (void)deleteDomains:(NSArray *)domains
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [CSSearchableIndex.defaultSearchableIndex
      deleteSearchableItemsWithDomainIdentifiers:domains
                               completionHandler:^(NSError *error) {
                                 SettlePromise(resolve, reject, error);
                               }];
}

- (void)deleteAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [CSSearchableIndex.defaultSearchableIndex deleteAllSearchableItemsWithCompletionHandler:^(
                                                NSError *error) {
    SettlePromise(resolve, reject, error);
  }];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeSpotlightIndexSpecJSI>(params);
}

@end

