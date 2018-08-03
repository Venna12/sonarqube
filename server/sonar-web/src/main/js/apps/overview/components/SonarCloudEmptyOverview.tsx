/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import AnalyzeTutorial from '../../tutorials/analyzeProject/AnalyzeTutorial';
import MetaContainer from '../meta/MetaContainer';
import { BranchLike, Component, CurrentUser, isLoggedIn } from '../../../app/types';
import { isLongLivingBranch, isBranch, isMainBranch } from '../../../helpers/branches';
import { translate } from '../../../helpers/l10n';
import { getCurrentUser } from '../../../store/rootReducer';
import '../../../app/styles/sonarcloud.css';

interface OwnProps {
  branchLike?: BranchLike;
  branchLikes: BranchLike[];
  component: Component;
  hasAnalyses?: boolean;
  onComponentChange: (changes: {}) => void;
}

interface StateProps {
  currentUser: CurrentUser;
}

type Props = OwnProps & StateProps;

export function SonarCloudEmptyOverview({
  branchLike,
  branchLikes,
  component,
  currentUser,
  hasAnalyses,
  onComponentChange
}: Props) {
  const hasBranches = branchLikes.length > 1;
  const hasBadBranchConfig =
    branchLikes.length > 2 ||
    (branchLikes.length === 2 && branchLikes.some(branch => isLongLivingBranch(branch)));
  return (
    <div className="page page-limited">
      <div className="overview page-with-sidebar">
        <div className="overview-main page-main sonarcloud">
          {isLoggedIn(currentUser) && isMainBranch(branchLike) ? (
            <>
              {hasBranches && (
                <WarningMessage
                  branchLike={branchLike}
                  message={
                    hasBadBranchConfig
                      ? translate('provisioning.no_analysis_on_main_branch.bad_configuration')
                      : translate('provisioning.no_analysis_on_main_branch')
                  }
                />
              )}
              {!hasBranches &&
                !hasAnalyses && <AnalyzeTutorial component={component} currentUser={currentUser} />}
            </>
          ) : (
            <WarningMessage
              branchLike={branchLike}
              message={translate('provisioning.no_analysis_on_main_branch')}
            />
          )}
        </div>

        <div className="overview-sidebar page-sidebar-fixed">
          <MetaContainer
            branchLike={branchLike}
            component={component}
            onComponentChange={onComponentChange}
          />
        </div>
      </div>
    </div>
  );
}

export function WarningMessage({
  branchLike,
  message
}: {
  branchLike?: BranchLike;
  message: string;
}) {
  if (!isBranch(branchLike)) {
    return null;
  }
  return (
    <div className="alert alert-warning">
      <FormattedMessage
        defaultMessage={message}
        id={message}
        values={{
          branchName: branchLike.name,
          branchType: (
            <div className="outline-badge text-baseline">{translate('branches.main_branch')}</div>
          )
        }}
      />
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  currentUser: getCurrentUser(state)
});

export default connect<StateProps, {}, OwnProps>(mapStateToProps)(SonarCloudEmptyOverview);