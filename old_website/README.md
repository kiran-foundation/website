# Setting up for local development

There are probably different ways to go about this, but sometimes what matters
is to have one at all. Doing the following was tested by @consideRatio
2019-10-19 on Ubuntu 19.04.

1. Install Ruby, Gem, and Bundler.

   1. Install [`rbenv`](https://github.com/rbenv/rbenv#installation).
   1. Install the [rbenv-build plugin](https://github.com/rbenv/ruby-build#installation) to allows you to use `rbenv install`.
   1. Run `rbenv install <version>` with the [latest stable version](https://www.ruby-lang.org/en/downloads/).
   1. Run `rbenv global <version>`.
   1. Verify you can run `ruby -v` and `gem -v`.
   1. Run `gem install bundler` to work with Gemfiles etc.

1. Install Jekyll.

   1. Checkout the `gh-pages` branch with `git checkout gh-pages`.
   1. Run `bundle install`

1. Start a local webserver.

   1. Run `bundle exec jekyll serve`.
   1. Visit http://localhost:4000.

[GitHub Pages]: https://pages.github.com/
[Jekyll]: https://jekyllrb.com
[Liquid]: https://shopify.github.io/liquid/
