import {ResultProps} from '../../components/Result';

export interface Optimizer {
  optimize(file: File): Promise<ResultProps>
}
