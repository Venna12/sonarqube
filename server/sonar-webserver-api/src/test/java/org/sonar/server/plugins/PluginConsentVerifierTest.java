/*
 * SonarQube
 * Copyright (C) 2009-2021 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.server.plugins;

import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.utils.System2;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;
import org.sonar.core.extension.PluginRiskConsent;
import org.sonar.db.DbClient;
import org.sonar.db.DbTester;
import org.sonar.db.property.PropertyDto;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.sonar.core.config.CorePropertyDefinitions.PLUGINS_RISK_CONSENT;
import static org.sonar.core.extension.PluginRiskConsent.ACCEPTED;
import static org.sonar.core.extension.PluginRiskConsent.NOT_ACCEPTED;
import static org.sonar.core.extension.PluginRiskConsent.REQUIRED;
import static org.sonar.server.plugins.PluginType.BUNDLED;
import static org.sonar.server.plugins.PluginType.EXTERNAL;

public class PluginConsentVerifierTest {
  @Rule
  public DbTester db = DbTester.create(System2.INSTANCE);
  @Rule
  public LogTester logTester = new LogTester();

  private final DbClient dbClient = db.getDbClient();
  private final ServerPluginRepository pluginRepository = mock(ServerPluginRepository.class);
  private final PluginConsentVerifier underTest = new PluginConsentVerifier(pluginRepository, dbClient);

  @Test
  public void require_consent_when_exist_external_plugins_and_not_accepted() {
    setupExternalPluginConsent(NOT_ACCEPTED);
    setupExternalPlugin();

    underTest.start();

    assertThat(dbClient.propertiesDao().selectGlobalProperty(PLUGINS_RISK_CONSENT))
      .extracting(PropertyDto::getValue)
      .isEqualTo(REQUIRED.name());
  }

  @Test
  public void require_consent_when_exist_external_plugins_and_consent_property_not_exist() {
    setupExternalPlugin();

    underTest.start();

    assertThat(logTester.logs(LoggerLevel.WARN)).contains("Plugin(s) detected. The risk associated with installing plugins has not been accepted. The SonarQube admin needs to log in and accept the risk.");
    assertThat(dbClient.propertiesDao().selectGlobalProperty(PLUGINS_RISK_CONSENT))
      .extracting(PropertyDto::getValue)
      .isEqualTo(REQUIRED.name());
  }

  @Test
  public void consent_does_not_change_when_value_is_accepted() {
    setupExternalPluginConsent(ACCEPTED);
    setupExternalPlugin();

    underTest.start();

    assertThat(dbClient.propertiesDao().selectGlobalProperty(PLUGINS_RISK_CONSENT))
      .extracting(PropertyDto::getValue)
      .isEqualTo(ACCEPTED.name());
  }

  @Test
  public void consent_does_not_change_when_value_is_required() {
    setupExternalPluginConsent(REQUIRED);
    setupExternalPlugin();

    underTest.start();

    assertThat(dbClient.propertiesDao().selectGlobalProperty(PLUGINS_RISK_CONSENT))
      .extracting(PropertyDto::getValue)
      .isEqualTo(REQUIRED.name());
  }

  @Test
  public void consent_should_be_not_accepted_when_there_is_no_external_plugin_and_never_been_accepted() {
    setupExternalPluginConsent(REQUIRED);
    setupBundledPlugin();

    underTest.start();

    assertThat(dbClient.propertiesDao().selectGlobalProperty(PLUGINS_RISK_CONSENT)).isNull();
  }

  @Test
  public void do_nothing_when_there_is_no_external_plugin() {
    setupExternalPluginConsent(NOT_ACCEPTED);
    setupBundledPlugin();

    underTest.start();

    assertThat(dbClient.propertiesDao().selectGlobalProperty(PLUGINS_RISK_CONSENT))
      .extracting(PropertyDto::getValue)
      .isEqualTo(NOT_ACCEPTED.name());
  }

  private void setupExternalPluginConsent(PluginRiskConsent pluginRiskConsent) {
    dbClient.propertiesDao().saveProperty(new PropertyDto()
      .setKey(PLUGINS_RISK_CONSENT)
      .setValue(pluginRiskConsent.name()));
  }

  private void setupExternalPlugin() {
    ServerPlugin plugin = mock(ServerPlugin.class);
    when(plugin.getType()).thenReturn(EXTERNAL);
    when(pluginRepository.getPlugins()).thenReturn(asList(plugin));
  }

  private void setupBundledPlugin() {
    ServerPlugin plugin = mock(ServerPlugin.class);
    when(plugin.getType()).thenReturn(BUNDLED);
    when(pluginRepository.getPlugins()).thenReturn(asList(plugin));
  }

}
