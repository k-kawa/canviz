#
# This file is part of Canviz. See http://www.canviz.org/
# $Id: layoutlist.awk 394 2013-07-23 16:50:27Z ryandesign.com $
#

{
  print "/*"
  print " * This file is part of Canviz. See http://www.canviz.org/"
  print " */"
  print ""
  print "var layouts = ["
  for (i = 1; i <= NF; ++i) {
    line = "'" $i "'"
    if (i != NF) {
      line = line ","
    }
    print line
  }
  print "];"
}
