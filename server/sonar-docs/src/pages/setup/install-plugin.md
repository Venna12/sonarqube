---
title: Install a Plugin
url: /setup/install-plugin/
---

There are two ways to install plugins in SonarQube:

- **Marketplace** - With Community Edition, you can use Marketplace to automatically install plugins from the SonarQube. With commercial editions, you can browse plugins in the Marketplace, but you need to manually install and update your plugins.
- **Manual Installation** - You need to manually install plugins when using commercial editions of SonarQube. You can also manually install plugins if your SonarQube instance doesn't have internet access or the plugin you're installing isn't in the Marketplace.

[[warning]]
| Installing third-party plugins is inherently risky. A SonarQube administrator needs to acknowledge this risk in the Marketplace before installing plugins or when prompted in SonarQube after installing a plugin manually.

## Installing plugins from the Marketplace

[[info]]
|You can only install and update plugins from the Marketplace in SonarQube Community Edition. With commercial editions, you need manually install and update plugins.

If your instance has internet access and you're connected with a SonarQube user with the **Administer System** global permission, you can find the Marketplace at **Administration > Marketplace**. From here:

- Find the plugin you want to install
- Click **Install** and wait for the download to be processed

Once the download is complete, a **Restart** button will be available to restart your instance.

See [Marketplace](/instance-administration/marketplace/) for more details on how to configure your SonarQube Server to connect to the internet.

## Manual installing plugins

To manually install a plugin:

1. Download the plugin you want to install. The version needs to be compatible with your SonarQube version.
2. Put the downloaded jar in `$SONARQUBE_HOME/extensions/plugins`, and remove any previous versions of the same plugins.
3. Restart your SonarQube server.

## Uninstalling plugins

To uninstall a plugin from the Marketplace (**Administration > Marketplace**):
1. Sort the **Plugins** list by installed plugins by selecting **Installed** above the list.
2. Find the plugin you want to uninstall.
3. Click the **Uninstall** button to the right of the plugin information.
4. Restart your SonarQube server.

To uninstall a plugin manually:
1. Delete the plugin from the `$SONARQUBE-HOME/extensions/plugins` folder.
2. Restart your SonarQube server.