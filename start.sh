#!/bin/sh

exec 2> /tmp/py_test.log
exec 1>&2
set -x

echo "Starting start script"
echo "Sleeping 10s"
sleep 10s

#sudo service hostapd restart
echo "Entering test directory"
cd /home/pi/py_test/
echo "Starting python script"
sudo /usr/bin/python3 /home/pi/py_test/autoup.py
