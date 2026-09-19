require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'SpotlightIndex'
  s.version      = package['version']
  s.summary      = package['description']
  s.description  = package['description']
  s.license      = { :type => 'MIT', :file => 'LICENSE' }
  s.author       = 'Solomon Xie'
  s.homepage     = 'https://github.com/solomonxie/spotlight-lookup'
  s.platforms    = { :ios => '16.4' }
  s.source       = { :git => '' }

  s.source_files = 'ios/**/*.{h,m,mm}'
  s.frameworks   = 'CoreSpotlight', 'UniformTypeIdentifiers'

  install_modules_dependencies(s)
end
