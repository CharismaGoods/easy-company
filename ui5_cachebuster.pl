#!/usr/sap/tools_local/perl/bin/perl

use strict;
use warnings;

# use lib '/usr/sap/trans4/tools/perl/lib/perl5';
# use lib '/sapmnt/slc/perl/lib/perl5';
# use SLC;
# use SLC::Log;

# Detect whether we're running as CGI script or are called from OS level.
my $cgi;
BEGIN {
  if (!@ARGV && exists($ENV{'SERVER_NAME'})) {
    require CGI;
    require CGI::Carp;
    CGI::Carp->import(qw(fatalsToBrowser));
    $cgi = CGI->new();
  }
}

use Digest::file qw(digest_file_hex);
use File::Basename;
use File::Find;
use JSON;
use FindBin qw($Bin);

# $SLC::Log::USAGE_TEXT = <<'USAGE';
# Description:
# ============
 # Create an index file for the UI5 Application Cache Buster:
 # https://sapui5.hana.ondemand.com/#/topic/ff7aceda0bd24039beb9bca8e882825d

# Usage:
# ======
 # ui5_cachebuster.pl -d /web/html/myapp -w
 # ui5_cachebuster.pl -d . -v

# Options:
# ========
 # **-d** <dir>   Base directory for which the index shall be generated. May be "." for the current directory.
 # **-w**         Write the result to <dir>/sap-ui-cachebuster-info.json instead of displaying it.
 # **-v**         Verbose mode. Shows files which are implicitly ignored.

# USAGE

# Parse options.
my ($dir, %opts);
if ($cgi) {
  if (!$ENV{'REDIRECT_REQUEST_FILENAME'}) {
    print $cgi->header(-type => 'text/plain', -status => '403 Forbidden');
    print "Script cannot be called directly!\n";
    exit();
  }
  $dir = dirname($ENV{'REDIRECT_REQUEST_FILENAME'});
}

# Find relevant files and calculate their fingerprints.
my %fingerprints;
find({wanted => sub {
  # Skip some unwanted files and directories.
  if (m/^\.|^(cgi-bin|scripts|sap-ui-cachebuster-info\.json)$|\.(html|md)$/) {
    # No need to check subdirectories (except for the root directory, of course).
    $File::Find::prune = 1 unless $_ eq '.';
    return;
  } elsif (!-f $_) {
    # Only files can be added to the index.
    return;
  }
  my $rel_path = $File::Find::name =~ s/^\Q$Bin\E//r;
  if ($rel_path =~ m#\.(js|xml|css|properties)$|(^|/)(resources|model)/# || $_ eq 'manifest.json') {
    # Use SHA1 hash as fingerprint. It could be anything which differs when the file contents change.
    $fingerprints{$rel_path} = digest_file_hex($_, 'SHA', 1);
  } elsif ($opts{'v'} && !-d $_) {
    # $logger->warning("Ignoring $rel_path");
  }
}}, $Bin);

# Write JSON.
my $json = JSON->new()->utf8()->canonical()->pretty()->space_before(0)->encode(\%fingerprints);
if ($cgi) {
  print $cgi->header(-type => 'application/json', '-Cache-Control' => 'no-cache');
  print $json;
} elsif ($opts{'w'}) {
  my $filename = 'sap-ui-cachebuster-info.json';
  open(my $fh, '>', $filename) or die("Could not open $filename: $!\n");
  print $fh $json;
  close($fh);
  # $logger->success("Updated $filename");
} else {
  print $json;
}
