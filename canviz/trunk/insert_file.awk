#
# This file is part of Canviz. See http://www.canviz.org/
# $Id: insert_file.awk 394 2013-07-23 16:50:27Z ryandesign.com $
#

BEGIN {
  replacement = ""
}

NR==FNR {
  gsub("\&", "\\\\\&", $0)
  replacement = replacement $0 "\n";
  next;
}

{
  gsub(placeholder, replacement, $0)
  print
}
