#import "TextFilePicker.h"

#import <React/RCTUtils.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

#import <TextFilePickerSpec/TextFilePickerSpec.h>

@interface TextFilePicker () <NativeTextFilePickerSpec, UIDocumentPickerDelegate>
@property (nonatomic, copy) RCTPromiseResolveBlock resolve;
@property (nonatomic, copy) RCTPromiseRejectBlock reject;
@end

@implementation TextFilePicker

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (void)pickTextFile:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  if (self.resolve) {
    reject(@"ERR_PICKER_BUSY", @"A file picker is already open.", nil);
    return;
  }
  self.resolve = resolve;
  self.reject = reject;

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *presenter = RCTPresentedViewController();
    if (presenter == nil) {
      [self settleWithResult:nil error:RCTErrorWithMessage(@"No view controller to present from.")];
      return;
    }
    // asCopy, so the copy in the temporary directory can be read without a security scope.
    UIDocumentPickerViewController *picker =
        [[UIDocumentPickerViewController alloc] initForOpeningContentTypes:@[ UTTypeItem ]
                                                                    asCopy:YES];
    picker.delegate = self;
    picker.allowsMultipleSelection = NO;
    [presenter presentViewController:picker animated:YES completion:nil];
  });
}

- (void)documentPicker:(UIDocumentPickerViewController *)controller
    didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls
{
  NSURL *url = urls.firstObject;
  if (url == nil) {
    [self settleWithResult:nil error:nil];
    return;
  }

  NSError *error;
  NSString *text = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:&error];
  if (text == nil) {
    NSStringEncoding encoding = 0;
    text = [NSString stringWithContentsOfURL:url usedEncoding:&encoding error:&error];
  }
  if (text == nil) {
    [self settleWithResult:nil error:error];
    return;
  }
  [self settleWithResult:@{@"name" : url.lastPathComponent, @"text" : text} error:nil];
}

- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller
{
  [self settleWithResult:nil error:nil];
}

- (void)settleWithResult:(NSDictionary *)result error:(NSError *)error
{
  RCTPromiseResolveBlock resolve = self.resolve;
  RCTPromiseRejectBlock reject = self.reject;
  self.resolve = nil;
  self.reject = nil;

  if (error) {
    reject(@"ERR_FILE_READ", error.localizedDescription, error);
  } else {
    resolve(result);
  }
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeTextFilePickerSpecJSI>(params);
}

@end
