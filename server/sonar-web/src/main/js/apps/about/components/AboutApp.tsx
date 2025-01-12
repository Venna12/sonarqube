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
import { sanitize } from 'dompurify';
import { Location } from 'history';
import { keyBy } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { translate } from 'sonar-ui-common/helpers/l10n';
import { addWhitePageClass, removeWhitePageClass } from 'sonar-ui-common/helpers/pages';
import { searchProjects } from '../../../api/components';
import { getFacet } from '../../../api/issues';
import A11ySkipTarget from '../../../app/components/a11y/A11ySkipTarget';
import withIndexationContext, {
  WithIndexationContextProps
} from '../../../components/hoc/withIndexationContext';
import {
  getAppState,
  getCurrentUser,
  getGlobalSettingValue,
  Store
} from '../../../store/rootReducer';
import { fetchAboutPageSettings } from '../actions';
import '../styles.css';
import AboutCleanCode from './AboutCleanCode';
import AboutLanguages from './AboutLanguages';
import AboutLeakPeriod from './AboutLeakPeriod';
import AboutProjects from './AboutProjects';
import AboutQualityGates from './AboutQualityGates';
import AboutQualityModel from './AboutQualityModel';
import AboutScanners from './AboutScanners';
import AboutStandards from './AboutStandards';
import EntryIssueTypes from './EntryIssueTypes';

interface Props extends WithIndexationContextProps {
  currentUser: T.CurrentUser;
  customText?: string;
  fetchAboutPageSettings: () => Promise<void>;
  location: Location;
}

interface State {
  issueTypes?: T.Dict<{ count: number }>;
  loading: boolean;
  projectsCount: number;
}

export class AboutApp extends React.PureComponent<Props, State> {
  mounted = false;

  state: State = {
    loading: true,
    projectsCount: 0
  };

  componentDidMount() {
    this.mounted = true;
    this.loadData();
    addWhitePageClass();
  }

  componentWillUnmount() {
    this.mounted = false;
    removeWhitePageClass();
  }

  loadProjects() {
    return searchProjects({ ps: 1 }).then(r => r.paging.total);
  }

  loadIssues() {
    return getFacet({ resolved: false }, 'types');
  }

  loadCustomText() {
    return this.props.fetchAboutPageSettings();
  }

  loadData() {
    Promise.all([
      this.loadProjects(),
      this.props.indexationContext.status.isCompleted
        ? this.loadIssues().catch(() => undefined)
        : Promise.resolve(undefined),
      this.loadCustomText()
    ]).then(
      responses => {
        if (this.mounted) {
          const [projectsCount = 0, issues] = responses;
          const issueTypes = issues && keyBy(issues.facet, 'val');
          this.setState({ projectsCount, issueTypes, loading: false });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      }
    );
  }

  render() {
    const { customText } = this.props;
    const { loading, issueTypes, projectsCount } = this.state;

    let bugs;
    let vulnerabilities;
    let codeSmells;
    if (!loading && issueTypes) {
      bugs = issueTypes['BUG'] && issueTypes['BUG'].count;
      vulnerabilities = issueTypes['VULNERABILITY'] && issueTypes['VULNERABILITY'].count;
      codeSmells = issueTypes['CODE_SMELL'] && issueTypes['CODE_SMELL'].count;
    }

    return (
      <div className="page page-limited about-page" id="about-page">
        <A11ySkipTarget anchor="about_main" />

        <div className="about-page-entry">
          <div className="about-page-intro">
            <h1 className="big-spacer-bottom">{translate('layout.sonar.slogan')}</h1>
            {!this.props.currentUser.isLoggedIn && (
              <Link className="button button-active big-spacer-right" to="/sessions/new">
                {translate('layout.login')}
              </Link>
            )}
            <Link className="button" to="/documentation">
              {translate('about_page.read_documentation')}
            </Link>
          </div>

          <div className="about-page-instance">
            <AboutProjects count={projectsCount} loading={loading} />
            {issueTypes && (
              <EntryIssueTypes
                bugs={bugs}
                codeSmells={codeSmells}
                loading={loading}
                vulnerabilities={vulnerabilities}
              />
            )}
          </div>
        </div>

        {customText && (
          <div
            className="about-page-section"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitize(customText) }}
          />
        )}

        <AboutLanguages />

        <AboutQualityModel />

        <div className="flex-columns">
          <div className="flex-column flex-column-half about-page-group-boxes">
            <AboutCleanCode />
          </div>
          <div className="flex-column flex-column-half about-page-group-boxes">
            <AboutLeakPeriod />
          </div>
        </div>

        <div className="flex-columns">
          <div className="flex-column flex-column-half about-page-group-boxes">
            <AboutQualityGates />
          </div>
          <div className="flex-column flex-column-half about-page-group-boxes">
            <AboutStandards />
          </div>
        </div>

        <AboutScanners />
      </div>
    );
  }
}

const mapStateToProps = (state: Store) => {
  const customText = getGlobalSettingValue(state, 'sonar.lf.aboutText');
  return {
    appState: getAppState(state),
    currentUser: getCurrentUser(state),
    customText: customText && customText.value
  };
};

const mapDispatchToProps = { fetchAboutPageSettings } as any;

export default withIndexationContext(connect(mapStateToProps, mapDispatchToProps)(AboutApp));
