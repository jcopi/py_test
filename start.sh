#!/bin/bash
sleep 30s

sudo service hostapd restart
sudo python3 autoup.py
