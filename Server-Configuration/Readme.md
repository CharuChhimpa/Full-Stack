# Server- Configuration
This project contains the whole procedure and details about configuring apache to run flask-psql server.
The linux server in this case is Digital Ocean.

### IP Address 
http://165.227.57.104/
### SSH Port
2200
### Project URL
http://charuchhimpa.ml

## Procedure to be followed : 

### Step 1:
First to start a new server we have to create a new droplet on Digital Ocean.
* Choose Distribution - Ubuntu 16.04 x 64
* Choose Size - $5/mo
* Choose preferred datacenter location
* Now, create new ssh key named 'server_root'.
  * Open terminal in your pc and run the command : ``` ssh-keygen ```.
  * Save your key to filepath ``` /Usrers/USER_NAME/.ssh/server_root.
* Copy the contents of file ``` /Users/USER_NAME/.ssh/server_root.pub.
* Return to create droplets form and click on new ssh button.
* Paste the data to contents section and name it to 'server_root'.
* Choose droplet no. to be 1.
* Name your droplet.
* Finish. Click on Create button.

### Step 2:
Your new droplet is created, congratulations. Now, copy your droplet's IP address and run the command below to ssh into the server :   

``` ssh -i ~/.ssh/server_root root@165.227.57.104 ```   

After this you would have your server running.  


### Step 3:
Update the installed packages with following commands :   
``` 
    sudo apt-get update
    sudo apt-get upgrade
```

Other Updates
``` sudo apt-get install unattended-upgrades
    sudo unattended-upgrades 
```

