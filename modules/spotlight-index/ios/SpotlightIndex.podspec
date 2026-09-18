Pod::Spec.new do |s|
  s.name           = 'SpotlightIndex'
  s.version        = '0.1.0'
  s.summary        = 'Core Spotlight indexing for dictionary entries and flashcards'
  s.description    = 'Local Expo module that pushes searchable items into Core Spotlight and reports taps on them back to JavaScript.'
  s.author         = 'Solomon Xie'
  s.homepage       = 'https://github.com/solomonxie/spotlight-lookup'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'CoreSpotlight', 'UniformTypeIdentifiers'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
