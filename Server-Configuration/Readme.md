# Server- Configuration
This project contains the whole procedure and details about configuring apache to run flask-psql server.
The linux server in this case is Digital Ocean.

### IP Address 
http://165.227.57.104/
### SSH Port
2200
### Project URL
http://chhimpa.tk

## Procedure to be followed : 

### Step 1:
First to start a new server we have to create a new droplet on Digital Ocean.
* Choose Distribution - Ubuntu 16.04 x 64
* Choose Size - $5/mo
* Choose preferred datacenter location
* Now, create new ssh key named 'catalog_root'.
  * Open terminal in your pc and run the command : ``` ssh-keygen ```.
  * Save your key to filepath ``` /Usrers/USER_NAME/.ssh/catalog_root```.
  * Set the passphrase to "password".
* Copy the contents of file ``` /Users/USER_NAME/.ssh/catalog_root.pub```.
* Return to create droplets form and click on new ssh button.
* Paste the data to contents section and name it to 'catalog_root'.
* Choose droplet no. to be 1.
* Name your droplet.
* Finish. Click on Create button.

### Step 2:
Your new droplet is created, congratulations. Now, copy your droplet's IP address and run the command below to ssh into the server :   

``` ssh -i ~/.ssh/catalog_root root@165.227.57.104 ```   

After this you would have your server running.  


### Step 3:
Update the installed packages with following commands :   
``` 
sudo apt-get update
sudo apt-get upgrade
```

Other Updates
``` 
sudo apt-get install unattended-upgrades
sudo unattended-upgrades 
```

### Step 4:
Change ssh port from 22 to 2200. To do this open ssh config by running the following command :   
``` sudo nano /etc/ssh/sshd_config ```  
Now, change port 22 to 2200 in this file.   

Restart ssh server   
``` sudo service ssh restart ```    

### Step 5:
 Now you need to specify pot no. to login
```ssh -p 2200  -i ~/.ssh/catalog_root root@YOUR_DROPLET_IP```

### Config UFW
Check current status of UFW
```
sudo ufw status
```

ConfigureUFW to only allow incoming connections for SSH (port 2200), HTTP (port 80), and NTP (port 123).

```
sudo ufw allow ssh
sudo ufw allow 2200/tcp
sudo ufw allow www
sudo ufw allow ntp
```

Remove port 22 from ufw
`sudo ufw delete allow 22`

Enable UFW
```
sudo ufw enable
```
### Step 6:
Create a new user named grader using the following command :  ```sudo adduser grader ```   
Provide the details needed.   
Now to provide grader the permission to sudo execute the following steps :    
* First create 'sudoers.d' file by the command : ``` touch /etc/sudoers.d/grader ```.   
* Next Add permission by opening file by : ``` sudo nano /etc/sudoers.d/grader ```.    
* Now add ``` grader ALL=(ALL) NOPASSWD:ALL ``` to file and save.   

### Step 7:
Now setup an ssh key pair for grader using ssh-keygen tool by following the same proceudre mentioned above, changing the location to ```/Users/USER_NAME/.ssh/catalog_grader```. Don't set any passphrase this time.  
Copy the contents of 'catalog_grader.pub' file.  After this follow the following procedure :    
* Switch user on server terminal by ```su - grader```.   
* Create directory named '.ssh' by ```mkdir .ssh```.
* Create file authorized_keys by ``` nano .ssh/authorized_keys```.   
* give correct permission to file by ```chmod 644 .ssh/authorized_keys```.  
* give correct permission to '.ssh' folder by ```chmod 700 .ssh```.  

Now, restart the ssh service :   
```sudo service ssh restart```   
Now you should be able to login as grader. Exit current connection and do the following.  
``` ssh -p 2200 -i ~/.ssh/catalog_grader grader@165.227.57.104 ```      
There is no passphrase needed.

### Step 8:
Now, we have to set the timezone. That can be done by the simple command :   
``` sudo timedatectl set-timezone Etc/UTC```   

### Step 9: 
We have to configure Apache to server a Python mod_wsgi application. To do so install following components.   
```
sudo apt-get install python3
sudo apt-get install python3-setuptools
sudo apt-get install apache2 libapache2-mod-wsgi-py3

```
Start Apache server :    
``` sudo service apache2 restart ```   

### Step 10: 
Install postgresql as follows   
``` sudo apt-get install postgresql```   
To disable remote connectios, make sure you don't have any other IPs besides 127.0.0.1 in the file :   
```sudo nano /etc/postgresql/VERSION/main/pg_hba.conf```    
Now, we have to create the database, to do so run the following command to get into the psql shell.  
```sudo -u postgres psql```   
Run the following commands to create the database :  
```
create user catalog with password 'password';
create database catalog with owner catalog;
```    
Exit the shell by ```\q```.   

### Step 11:
Install git by : ``` sudo apt-get install git```.    

Now, we need to get into the directory ```www``` by ```cd /var/www/```.   
Clone your project in this directory. Here the project is at https://github.com/CharuChhimpa/ud-catalog.git.   
Clone by ```sudo git https://github.com/CharuChhimpa/ud-catalog.git catalog```.   
Change directory to catalog by ```cd catalog``` . and execute the following commands to install dependencies.  
```
sudo apt-get install python-pip
sudo -H pip install -r requirements.txt
```    
### Step 12:

Now we need to run the project using Apache and mod-wsgi. So first create a configuration file for your project.

```sh
sudo nano /etc/apache2/sites-available/catalog.conf
```

It should have the following components.

```xml
<VirtualHost *:80>
    ServerName 165.227.57.104

    WSGIScriptAlias / /var/www/catalog/wsgi.py

    <Directory /var/www/catalog>
        Order allow,deny
        Allow from all
    </Directory>
</VirtualHost>
```

Add a wsgi file by running the command ```sudo nano wsgi.py``` adn add the following contents.   

```python
import sys

sys.path.insert(0, '/var/www/catalog')

from catalog import app as application

application.secret_key = 'New secret key. Change it on server'

application.config['SQLALCHEMY_DATABASE_URI'] = (
    'postgresql://'
    'catalog:password@localhost/catalog')
```

Enable the site and restart Apache.

```
sudo a2ensite catalog  # enable site
sudo service apache2 reload
```

The server should be live now. Visit the IP to check (http://165.227.57.104).   

Check the logs for errors.  

```sh
sudo cat /var/log/apache2/error.log
```

### Step 13:
Since google oauth dosen't works with only IP. Setup subdomain and link your ip to it.   

Configure your OAuth 2.0 credential and update authorized origin and redirect URIs with your subdomain.   

Finally to Disbale password based authentication and Root login do the following :   
In config file
```
sudo nano /etc/ssh/sshd_config
```
Change
```
PermitRootLogin no 
PasswordAuthentication no
```
Save it and restart ssh service
```
sudo service ssh restart
```

## Third Party Resources
* https://www.digitalocean.com/community/tutorials/how-to-use-ssh-keys-with-digitalocean-droplets
* http://flask.pocoo.org/docs/0.12/deploying/mod_wsgi/






