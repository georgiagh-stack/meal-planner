#!/bin/sh
# Override DNS with Google's public resolvers, which resolve .co.uk domains globally
echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf
exec node server.js
