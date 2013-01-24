# Arrow

Visualize data from DataSift

## About Arrow

Arrow is an analytical dashboard which will visualize a [DataSift](http://datasift.com) stream, simple!  We've built it entirely on JavaScript and we are open sourcing it for anyone to fork, modify and play around with Arrow.  We welcome feedback and bugs through our Issues page, and would love to know what you are developing with it.  You can give Arrow a try right now, all you need is your API key, username and a Stream hash from [DataSift](http://datasift.com/dashboard).

##  Try it!

We like Arrow so much that we decided to share it with the world.  You can visit our live [demo page](http://datasift.github.com/Arrow/demo/) and see it in action for yourself.  You will need the following three pieces of information:

 * your [DataSift](http://datasift.com/) username

 * your DataSift API key (you can find it on your DataSift [account page](http://datasift.com/dashboard))

 * the hash of the stream that defines your filter (if you do not know where to start, use 3fb90331a264b254e46a6a43d7468a1d)


## Technical Details

The visualizations use the [D3](http://d3js.org) library for rendering. We currently support three types of visualizations:

  * pie charts
  * line charts
  * maps

We designed Arrow to be as flexible as possible, so you can pull out the visualizations and use them in your projects, or even create visualizations of your own.

## ASCII Art

         \\\\\_____________________\"-._
         /////~~~~~~~~~~~~~~~~~~~~~/.-'
